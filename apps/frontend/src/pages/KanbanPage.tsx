import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, CheckSquare, X, Tag } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export const KanbanPage: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'TODO',
      title: 'Por Hacer',
      tasks: [
        { id: '1', title: 'Comprar pelotas de entrenamiento Molten v5', category: 'Equipamiento' },
        { id: '2', title: 'Confirmar transporte para torneo en San Lorenzo', category: 'Logística' }
      ]
    },
    {
      id: 'IN_PROGRESS',
      title: 'En Proceso',
      tasks: [
        { id: '3', title: 'Cobro de cuotas mensuales de categorías Sub-18', category: 'Tesorería' }
      ]
    },
    {
      id: 'DONE',
      title: 'Completado',
      tasks: [
        { id: '4', title: 'Sincronizar reporte de asistencias en Google Sheets', category: 'Sistema' }
      ]
    }
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Equipamiento');
  const [targetColumnId, setTargetColumnId] = useState('TODO');

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const col = columns.find((c) => c.id === source.droppableId);
      if (!col) return;
      const newTasks = Array.from(col.tasks);
      const [moved] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, moved);

      setColumns(columns.map((c) => (c.id === col.id ? { ...c, tasks: newTasks } : c)));
    } else {
      const sourceCol = columns.find((c) => c.id === source.droppableId)!;
      const destCol = columns.find((c) => c.id === destination.droppableId)!;

      const sourceTasks = Array.from(sourceCol.tasks);
      const destTasks = Array.from(destCol.tasks);

      const [moved] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, moved);

      setColumns(
        columns.map((c) => {
          if (c.id === sourceCol.id) return { ...c, tasks: sourceTasks };
          if (c.id === destCol.id) return { ...c, tasks: destTasks };
          return c;
        })
      );
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      category: newCategory
    };

    setColumns(
      columns.map((col) =>
        col.id === targetColumnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );

    // Reset Form & Close
    setNewTitle('');
    setNewCategory('Equipamiento');
    setTargetColumnId('TODO');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-svc-brightGreen" />
            <span>Tablero Kanban de Tareas Operativas</span>
          </h1>
          <p className="text-sm text-svc-muted mt-1">Gestión de actividades del club y logística de equipos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-svc-green hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-svc-card border border-svc-border p-4 rounded-2xl flex flex-col">
              <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase flex items-center justify-between">
                <span>{column.title}</span>
                <span className="bg-svc-input px-2.5 py-0.5 rounded-full text-xs text-svc-muted">
                  {column.tasks.length}
                </span>
              </h3>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 space-y-3 min-h-[300px]"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-svc-input border border-svc-border hover:border-svc-green p-4 rounded-xl shadow-md transition-all cursor-grab active:cursor-grabbing"
                          >
                            <span className="text-[10px] font-semibold uppercase bg-svc-green/20 text-svc-brightGreen px-2 py-0.5 rounded">
                              {task.category}
                            </span>
                            <p className="text-sm text-white font-medium mt-2">{task.title}</p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal para Crear Nueva Tarea */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-svc-card border border-svc-border w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-svc-border pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-svc-brightGreen" />
                <span>Agregar Nueva Tarea</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-svc-muted hover:text-white p-1 rounded-lg hover:bg-svc-input transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">
                  Título de la Tarea
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Comprar red oficial de competencia"
                  className="w-full bg-svc-input border border-svc-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-svc-input border border-svc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                  >
                    <option value="Equipamiento">Equipamiento</option>
                    <option value="Logística">Logística</option>
                    <option value="Tesorería">Tesorería</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Sistema">Sistema</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-svc-muted mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={targetColumnId}
                    onChange={(e) => setTargetColumnId(e.target.value)}
                    className="w-full bg-svc-input border border-svc-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-svc-green"
                  >
                    <option value="TODO">Por Hacer</option>
                    <option value="IN_PROGRESS">En Proceso</option>
                    <option value="DONE">Completado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-svc-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-svc-input hover:bg-gray-800 text-svc-muted hover:text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-svc-green hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-lg transition-all"
                >
                  Crear Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
