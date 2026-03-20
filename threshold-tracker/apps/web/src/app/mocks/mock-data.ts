import { Task } from '../models/task.model';
import { Score } from '../models/score.model';

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    name: 'Gridshot',
    category: 'clicking',
    threshold: 85000,
    personal_best: 94200,
    notes: 'Aim Lab - foco em precisão e velocidade',
    created_date: '2025-11-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Sixshot',
    category: 'flicking',
    threshold: 110000,
    personal_best: 121500,
    notes: 'Kovaaks - treino de flick para alvos grandes',
    created_date: '2025-11-05T14:30:00Z',
  },
  {
    id: '3',
    name: 'Smoothbot',
    category: 'tracking',
    threshold: 68,
    personal_best: 79,
    notes: 'Kovaaks - tracking contínuo de alvos em movimento',
    created_date: '2025-11-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Motionshot',
    category: 'tracking',
    threshold: 72,
    personal_best: 83,
    created_date: '2025-11-12T16:00:00Z',
  },
  {
    id: '5',
    name: 'Close Fast Precise',
    category: 'clicking',
    threshold: 65,
    personal_best: 74,
    notes: 'Kovaaks - precisão em targets próximos',
    created_date: '2025-11-18T11:00:00Z',
  },
  {
    id: '6',
    name: 'Valorant Switching',
    category: 'switching',
    threshold: 58000,
    personal_best: 67400,
    notes: 'Cenário específico para duelos Valorant',
    created_date: '2025-12-01T20:00:00Z',
  },
  {
    id: '7',
    name: 'Microshot',
    category: 'flicking',
    threshold: 88000,
    personal_best: 97300,
    notes: 'Flicks precisos em alvos pequenos',
    created_date: '2025-12-10T13:45:00Z',
  },
  {
    id: '8',
    name: 'Bounce 180',
    category: 'other',
    personal_best: 52100,
    notes: 'Treino de reação e 180 turns',
    created_date: '2026-01-05T08:30:00Z',
  },
];

function d(daysAgo: number, hoursAgo = 0): string {
  const date = new Date('2026-03-19T12:00:00Z');
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

export const MOCK_SCORES: Score[] = [
  // Gridshot (task 1) — 12 scores, improving trend
  { id: 's101', task_id: '1', value: 74200, sensitivity: '0.35', fov: 103, dpi: 800, created_date: d(60) },
  { id: 's102', task_id: '1', value: 77800, sensitivity: '0.35', fov: 103, dpi: 800, created_date: d(52) },
  { id: 's103', task_id: '1', value: 76500, sensitivity: '0.35', fov: 103, dpi: 800, created_date: d(45) },
  { id: 's104', task_id: '1', value: 80100, sensitivity: '0.33', fov: 103, dpi: 800, created_date: d(38) },
  { id: 's105', task_id: '1', value: 82400, sensitivity: '0.33', fov: 103, dpi: 800, created_date: d(31) },
  { id: 's106', task_id: '1', value: 81000, sensitivity: '0.33', fov: 103, dpi: 800, created_date: d(25) },
  { id: 's107', task_id: '1', value: 84700, sensitivity: '0.32', fov: 103, dpi: 800, created_date: d(20) },
  { id: 's108', task_id: '1', value: 86300, sensitivity: '0.32', fov: 103, dpi: 800, created_date: d(15) },
  { id: 's109', task_id: '1', value: 88900, sensitivity: '0.32', fov: 103, dpi: 800, created_date: d(10) },
  { id: 's110', task_id: '1', value: 90400, sensitivity: '0.31', fov: 103, dpi: 800, created_date: d(6) },
  { id: 's111', task_id: '1', value: 92100, sensitivity: '0.31', fov: 103, dpi: 800, created_date: d(3) },
  { id: 's112', task_id: '1', value: 94200, is_pb: true, sensitivity: '0.31', fov: 103, dpi: 800, created_date: d(1) },

  // Sixshot (task 2) — 9 scores
  { id: 's201', task_id: '2', value: 98000, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(55) },
  { id: 's202', task_id: '2', value: 101500, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(48) },
  { id: 's203', task_id: '2', value: 99800, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(40) },
  { id: 's204', task_id: '2', value: 105200, sensitivity: '0.38', fov: 103, dpi: 800, created_date: d(33) },
  { id: 's205', task_id: '2', value: 108700, sensitivity: '0.38', fov: 103, dpi: 800, created_date: d(25) },
  { id: 's206', task_id: '2', value: 112300, sensitivity: '0.37', fov: 103, dpi: 800, created_date: d(18) },
  { id: 's207', task_id: '2', value: 115900, sensitivity: '0.37', fov: 103, dpi: 800, created_date: d(11) },
  { id: 's208', task_id: '2', value: 118000, sensitivity: '0.36', fov: 103, dpi: 800, created_date: d(5) },
  { id: 's209', task_id: '2', value: 121500, is_pb: true, sensitivity: '0.36', fov: 103, dpi: 800, created_date: d(1, 3) },

  // Smoothbot (task 3) — 8 scores
  { id: 's301', task_id: '3', value: 58, sensitivity: '0.42', fov: 103, dpi: 800, created_date: d(50) },
  { id: 's302', task_id: '3', value: 61, sensitivity: '0.42', fov: 103, dpi: 800, created_date: d(42) },
  { id: 's303', task_id: '3', value: 60, sensitivity: '0.42', fov: 103, dpi: 800, created_date: d(35) },
  { id: 's304', task_id: '3', value: 64, sensitivity: '0.41', fov: 103, dpi: 800, created_date: d(28) },
  { id: 's305', task_id: '3', value: 67, sensitivity: '0.41', fov: 103, dpi: 800, created_date: d(21) },
  { id: 's306', task_id: '3', value: 70, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(14) },
  { id: 's307', task_id: '3', value: 74, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(7) },
  { id: 's308', task_id: '3', value: 79, is_pb: true, sensitivity: '0.39', fov: 103, dpi: 800, created_date: d(2) },

  // Motionshot (task 4) — 6 scores
  { id: 's401', task_id: '4', value: 64, sensitivity: '0.42', fov: 103, dpi: 800, created_date: d(40) },
  { id: 's402', task_id: '4', value: 68, sensitivity: '0.42', fov: 103, dpi: 800, created_date: d(32) },
  { id: 's403', task_id: '4', value: 71, sensitivity: '0.41', fov: 103, dpi: 800, created_date: d(24) },
  { id: 's404', task_id: '4', value: 74, sensitivity: '0.41', fov: 103, dpi: 800, created_date: d(16) },
  { id: 's405', task_id: '4', value: 79, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(8) },
  { id: 's406', task_id: '4', value: 83, is_pb: true, sensitivity: '0.40', fov: 103, dpi: 800, created_date: d(2, 4) },

  // Close Fast Precise (task 5) — 7 scores
  { id: 's501', task_id: '5', value: 54, sensitivity: '0.35', fov: 103, dpi: 800, created_date: d(45) },
  { id: 's502', task_id: '5', value: 57, sensitivity: '0.35', fov: 103, dpi: 800, created_date: d(37) },
  { id: 's503', task_id: '5', value: 60, sensitivity: '0.34', fov: 103, dpi: 800, created_date: d(29) },
  { id: 's504', task_id: '5', value: 63, sensitivity: '0.34', fov: 103, dpi: 800, created_date: d(21) },
  { id: 's505', task_id: '5', value: 67, sensitivity: '0.33', fov: 103, dpi: 800, created_date: d(13) },
  { id: 's506', task_id: '5', value: 70, sensitivity: '0.33', fov: 103, dpi: 800, created_date: d(5) },
  { id: 's507', task_id: '5', value: 74, is_pb: true, sensitivity: '0.33', fov: 103, dpi: 800, created_date: d(1, 8) },

  // Valorant Switching (task 6) — 5 scores
  { id: 's601', task_id: '6', value: 49000, sensitivity: '0.38', fov: 103, dpi: 800, created_date: d(30) },
  { id: 's602', task_id: '6', value: 53200, sensitivity: '0.38', fov: 103, dpi: 800, created_date: d(22) },
  { id: 's603', task_id: '6', value: 58700, sensitivity: '0.37', fov: 103, dpi: 800, created_date: d(15) },
  { id: 's604', task_id: '6', value: 62400, sensitivity: '0.37', fov: 103, dpi: 800, created_date: d(8) },
  { id: 's605', task_id: '6', value: 67400, is_pb: true, sensitivity: '0.36', fov: 103, dpi: 800, created_date: d(3) },

  // Microshot (task 7) — 6 scores
  { id: 's701', task_id: '7', value: 78000, sensitivity: '0.32', fov: 103, dpi: 800, created_date: d(25) },
  { id: 's702', task_id: '7', value: 82500, sensitivity: '0.32', fov: 103, dpi: 800, created_date: d(19) },
  { id: 's703', task_id: '7', value: 85100, sensitivity: '0.31', fov: 103, dpi: 800, created_date: d(13) },
  { id: 's704', task_id: '7', value: 89700, sensitivity: '0.31', fov: 103, dpi: 800, created_date: d(8) },
  { id: 's705', task_id: '7', value: 93400, sensitivity: '0.30', fov: 103, dpi: 800, created_date: d(4) },
  { id: 's706', task_id: '7', value: 97300, is_pb: true, sensitivity: '0.30', fov: 103, dpi: 800, created_date: d(1, 2) },

  // Bounce 180 (task 8) — 4 scores, no threshold
  { id: 's801', task_id: '8', value: 41000, sensitivity: '0.45', fov: 103, dpi: 800, created_date: d(20) },
  { id: 's802', task_id: '8', value: 44800, sensitivity: '0.45', fov: 103, dpi: 800, created_date: d(12) },
  { id: 's803', task_id: '8', value: 48300, sensitivity: '0.44', fov: 103, dpi: 800, created_date: d(6) },
  { id: 's804', task_id: '8', value: 52100, is_pb: true, sensitivity: '0.44', fov: 103, dpi: 800, created_date: d(2, 1) },
];
