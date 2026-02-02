import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

export type StepType = 'shell' | 'download_url' | 'download_cloud' | 'change_os' | 'http_request' | 'custom_js';

export interface RpaStep {
  id: string;
  type: StepType;
  name: string;
  params: any;
}

export interface RpaTask {
  id: string;
  name: string;
  steps: RpaStep[];
  createdAt: number;
}

export const useRpaStore = defineStore('rpa', () => {
  const tasks = ref<RpaTask[]>([]);
  const currentTaskId = ref<string | null>(null);

  const currentTask = computed(() => tasks.value.find(t => t.id === currentTaskId.value) || null);

  // Load tasks from LocalStorage
  function loadTasks() {
    const stored = localStorage.getItem('rpa_tasks');
    if (stored) {
      try {
        tasks.value = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse RPA tasks', e);
        tasks.value = [];
      }
    }
  }

  // Save tasks to LocalStorage
  function saveTasks() {
    localStorage.setItem('rpa_tasks', JSON.stringify(tasks.value));
  }

  function createTask() {
    const newTask: RpaTask = {
      id: Date.now().toString(),
      name: 'New Shortcut',
      steps: [],
      createdAt: Date.now()
    };
    tasks.value.push(newTask);
    currentTaskId.value = newTask.id;
    saveTasks();
    return newTask;
  }

  function updateTask(task: RpaTask) {
    const index = tasks.value.findIndex(t => t.id === task.id);
    if (index !== -1) {
      tasks.value[index] = { ...task };
      saveTasks();
    }
  }

  function deleteTask(id: string) {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value.splice(index, 1);
      if (currentTaskId.value === id) {
        currentTaskId.value = null;
      }
      saveTasks();
    }
  }

  function selectTask(id: string) {
    currentTaskId.value = id;
  }

  // Import/Export
  function exportTasks() {
    const dataStr = JSON.stringify(tasks.value, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpa_tasks_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    ElMessage.success('Exported tasks successfully');
  }

  async function importTasks(file: File) {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (Array.isArray(imported)) {
        // Basic validation
        const valid = imported.every(t => t.id && t.name && Array.isArray(t.steps));
        if (!valid) throw new Error('Invalid format');
        
        // Merge strategy: Append with new IDs to avoid conflicts, or just replace?
        // User asked for "import/export json", usually implies backup/restore or sharing.
        // Let's replace for now or merge distinct IDs? 
        // Safer: Merge, keep existing if ID different, overwrite if ID same (or prompt).
        // Simplest for now: Overwrite/Merge based on ID.
        
        // Let's do a smart merge: if ID exists, update; else add.
        imported.forEach((t: RpaTask) => {
            const idx = tasks.value.findIndex(existing => existing.id === t.id);
            if (idx !== -1) {
                tasks.value[idx] = t;
            } else {
                tasks.value.push(t);
            }
        });
        saveTasks();
        ElMessage.success(`Imported ${imported.length} tasks`);
      } else {
        throw new Error('Format must be an array of tasks');
      }
    } catch (e: any) {
      ElMessage.error('Import failed: ' + e.message);
    }
  }

  return {
    tasks,
    currentTaskId,
    currentTask,
    loadTasks,
    saveTasks,
    createTask,
    updateTask,
    deleteTask,
    selectTask,
    exportTasks,
    importTasks
  };
});
