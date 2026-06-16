/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// Utility for paths since package.json is "type": "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial clinical dataset seeds
const DEFAULT_LEADS = [
  {
    id: 'lead-1',
    name: 'Carlos Alberto Mendoza',
    phone: '987654321',
    email: 'carlos.mendoza@gmail.com',
    specialty: 'Ortodoncia Especializada',
    requestedDate: '2026-06-18',
    requestedTime: '15:00',
    comments: 'Interesado en brackets de zafiro estéticos. Refiere dolor leve al masticar en zona posterior.',
    status: 'Cita agendada',
    createdAt: '2026-06-13T10:00:00.000Z',
    bookingCode: 'MCG-8192',
    source: 'web_form',
    actionComments: 'Paciente con excelente disposición. Quiere iniciar tratamiento el mismo día.'
  },
  {
    id: 'lead-2',
    name: 'María Elena Farfán',
    phone: '912345678',
    email: 'maria.farfan@outlook.com',
    specialty: 'Implantes Dentales',
    requestedDate: '2026-06-20',
    requestedTime: '10:30',
    comments: 'Consulta por dos implantes molares inferiores. Desea saber sobre financiamiento.',
    status: 'Nuevo',
    createdAt: '2026-06-15T09:15:00.000Z',
    bookingCode: 'MCG-4012',
    source: 'web_form',
    actionComments: ''
  },
  {
    id: 'lead-3',
    name: 'Juan Daniel Torres',
    phone: '998877665',
    email: 'jtorres@hotmail.com',
    specialty: 'Odontopediatría Integral',
    requestedDate: '2026-06-19',
    requestedTime: '16:00',
    comments: 'Primera visita de su menor de 6 años. Refiere mucho pánico al dentista, requiere empatía.',
    status: 'Contactado',
    createdAt: '2026-06-14T15:30:00.000Z',
    bookingCode: 'MCG-1102',
    source: 'whatsapp_click',
    actionComments: 'Llamada de orientación. La madre se sintió aliviada con la explicación del especialista.'
  },
  {
    id: 'lead-4',
    name: 'Sofía Villanueva Ruíz',
    phone: '951753456',
    email: 'sofia.vr@gmail.com',
    specialty: 'Blanqueamiento Dental LED',
    requestedDate: '2026-06-12',
    requestedTime: '09:00',
    comments: 'Desea sonrisa brillante para su boda a fin de mes. Prefiere sesión de activación rápida.',
    status: 'Paciente registrado',
    createdAt: '2026-06-10T11:45:00.000Z',
    bookingCode: 'MCG-2993',
    source: 'web_form',
    actionComments: 'Sesión ejecutada con éxito. Altamente satisfecha, bajó 3 tonos en la escala Vita.'
  },
  {
    id: 'lead-5',
    name: 'Jorge Luis Huamán',
    phone: '945612378',
    email: 'jhuaman@pucp.edu.pe',
    specialty: 'Endodoncia Avanzada',
    requestedDate: '2026-06-17',
    requestedTime: '11:00',
    comments: 'Dolor pulsátil intenso que no le deja dormir en muela superior izquierda desde hace 2 días.',
    status: 'En seguimiento',
    createdAt: '2026-06-14T08:00:00.000Z',
    bookingCode: 'MCG-7489',
    source: 'web_form',
    actionComments: 'Se le medicó analgésicos. Cita programada de urgencia para apertura endodóntica.'
  },
  {
    id: 'lead-6',
    name: 'Ana Milagros Rosales',
    phone: '931256789',
    email: 'ana_rosales2@gmail.com',
    specialty: 'Estética Dental y Carillas',
    requestedDate: '2026-06-25',
    requestedTime: '17:30',
    comments: 'Consulta sobre carillas de resina y costo aproximado del diseño de sonrisa digital.',
    status: 'Nuevo',
    createdAt: '2026-06-15T22:40:00.000Z',
    bookingCode: 'MCG-5512',
    source: 'web_form',
    actionComments: ''
  },
  {
    id: 'lead-7',
    name: 'Roberto Carlos Díaz',
    phone: '967543210',
    email: 'roberto.diaz@gmail.com',
    specialty: 'Rehabilitación Oral',
    requestedDate: '2026-06-10',
    requestedTime: '14:00',
    comments: 'Solicita renovación de puente fijo desadaptado en zona molar.',
    status: 'Cerrado',
    createdAt: '2026-06-05T16:20:00.000Z',
    bookingCode: 'MCG-1090',
    source: 'web_form',
    actionComments: 'Paciente desistió temporalmente por motivos de viaje, retomará en 3 meses.'
  },
  {
    id: 'lead-8',
    name: 'Clara Inés Beltrán',
    phone: '981273645',
    email: 'clara_beltran@outlook.com',
    specialty: 'Cirugía Oral e Implantes',
    requestedDate: '2026-06-22',
    requestedTime: '12:00',
    comments: 'Extracción programada de 4 terceras molares (juicio) bajo sedación consciente.',
    status: 'Cita agendada',
    createdAt: '2026-06-12T14:15:00.000Z',
    bookingCode: 'MCG-8341',
    source: 'whatsapp_click',
    actionComments: 'Confirmada con anestesiólogo externo de la sede Multident.'
  }
];

const DEFAULT_ACTIVITIES = [
  {
    id: 'act-1',
    leadId: 'lead-1',
    leadName: 'Carlos Alberto Mendoza',
    action: 'Cita Agendada',
    details: 'Se programó cita presencial el 18-Jun a las 15:00 para Ortodoncia.',
    timestamp: '2026-06-13T10:30:00.000Z'
  },
  {
    id: 'act-2',
    leadId: 'lead-3',
    leadName: 'Juan Daniel Torres',
    action: 'Llamada de Orientación',
    details: 'Explicación del protocolo odontopediátrico sin trauma. Madre programará cita.',
    timestamp: '2026-06-14T16:00:00.000Z'
  },
  {
    id: 'act-3',
    leadId: 'lead-4',
    leadName: 'Sofía Villanueva Ruíz',
    action: 'Paciente Registrado',
    details: 'Asistió a evaluación y tratamiento inicial. Resultados de blanqueamiento archivados.',
    timestamp: '2026-06-12T10:00:00.000Z'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'new_lead',
    title: 'Nuevo Prospecto de Carillas',
    message: 'Ana Milagros Rosales solicitó cotización de Estética Dental desde el formulario web.',
    timestamp: '2026-06-15T22:40:00.000Z',
    isRead: false,
    leadId: 'lead-6'
  },
  {
    id: 'notif-2',
    type: 'new_lead',
    title: 'Nuevo Prospecto de Implantes',
    message: 'María Elena Farfán solicitó contacto por Implantes Dentales.',
    timestamp: '2026-06-15T09:15:00.000Z',
    isRead: false,
    leadId: 'lead-2'
  }
];

// Helper readers and writers
function readData<T>(filePath: string, defaultData: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileData);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}, defaulting:`, error);
  }
  // Initialize file
  writeData(filePath, defaultData);
  return defaultData;
}

function writeData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// REST api operations
app.get('/api/leads', (req: Request, res: Response) => {
  const leads = readData(LEADS_FILE, DEFAULT_LEADS);
  res.json(leads);
});

app.post('/api/leads', (req: Request, res: Response) => {
  const leads = readData(LEADS_FILE, DEFAULT_LEADS);
  const activities = readData(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  const notifications = readData(NOTIFICATIONS_FILE, DEFAULT_NOTIFICATIONS);

  const { name, phone, email, specialty, requestedDate, requestedTime, comments, source } = req.body;

  if (!name || !phone) {
    res.status(400).json({ error: 'Nombre y Teléfono son requeridos' });
    return;
  }

  const bookingIdNumber = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = `MCG-${bookingIdNumber}`;
  
  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    phone,
    email: email || '',
    specialty: specialty || 'Consulta General',
    requestedDate: requestedDate || new Date().toISOString().split('T')[0],
    requestedTime: requestedTime || '10:00',
    comments: comments || '',
    status: 'Nuevo' as const,
    createdAt: new Date().toISOString(),
    bookingCode,
    source: source || 'web_form',
    actionComments: ''
  };

  leads.unshift(newLead);
  writeData(LEADS_FILE, leads);

  // Log activity
  const newActivity = {
    id: `act-${Date.now()}`,
    leadId: newLead.id,
    leadName: newLead.name,
    action: 'Nuevo Registro',
    details: `Ingresó consulta para el servicio de: ${newLead.specialty} (${newLead.source === 'whatsapp_click' ? 'WhatsApp' : 'Web'}).`,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);
  writeData(ACTIVITIES_FILE, activities);

  // Trigger Notification
  const newNotification = {
    id: `notif-${Date.now()}`,
    type: 'new_lead' as const,
    title: 'Nuevo Paciente Potencial',
    message: `${newLead.name} agendó una consulta de ${newLead.specialty}.`,
    timestamp: new Date().toISOString(),
    isRead: false,
    leadId: newLead.id
  };
  notifications.unshift(newNotification);
  writeData(NOTIFICATIONS_FILE, notifications);

  res.status(201).json(newLead);
});

// Update lead status or data
app.patch('/api/leads/:id', (req: Request, res: Response) => {
  const leads = readData(LEADS_FILE, DEFAULT_LEADS);
  const activities = readData(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  const notifications = readData(NOTIFICATIONS_FILE, DEFAULT_NOTIFICATIONS);
  const { id } = req.params;

  const leadIndex = leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    res.status(404).json({ error: 'Lead no encontrado' });
    return;
  }

  const oldLead = leads[leadIndex];
  const { status, requestedDate, requestedTime, actionComments, comments, name, phone, email } = req.body;

  let activityMessage = '';
  let notificationMessage = '';
  let isUpdated = false;

  const updatedLead = { ...oldLead };

  if (name !== undefined) updatedLead.name = name;
  if (phone !== undefined) updatedLead.phone = phone;
  if (email !== undefined) updatedLead.email = email;
  if (comments !== undefined) updatedLead.comments = comments;

  if (status !== undefined && status !== oldLead.status) {
    updatedLead.status = status;
    activityMessage += `Estado actualizado de "${oldLead.status}" a "${status}". `;
    notificationMessage = `Paciente ${updatedLead.name} cambió su estado a: ${status}.`;
    isUpdated = true;
  }

  if (requestedDate !== undefined && requestedDate !== oldLead.requestedDate) {
    updatedLead.requestedDate = requestedDate;
    activityMessage += `Fecha reprogramada al ${requestedDate}. `;
    isUpdated = true;
  }

  if (requestedTime !== undefined && requestedTime !== oldLead.requestedTime) {
    updatedLead.requestedTime = requestedTime;
    activityMessage += `Hora reprogramada a las ${requestedTime}. `;
    isUpdated = true;
  }

  if (actionComments !== undefined) {
    updatedLead.actionComments = actionComments;
  }

  leads[leadIndex] = updatedLead;
  writeData(LEADS_FILE, leads);

  if (activityMessage) {
    const newActivity = {
      id: `act-${Date.now()}`,
      leadId: updatedLead.id,
      leadName: updatedLead.name,
      action: status !== undefined ? 'Cambio de Estado' : 'Reprogramación',
      details: activityMessage.trim() + (actionComments ? ` Nota: ${actionComments}` : ''),
      timestamp: new Date().toISOString()
    };
    activities.unshift(newActivity);
    writeData(ACTIVITIES_FILE, activities);
  }

  if (notificationMessage && isUpdated) {
    const newNotification = {
      id: `notif-${Date.now()}`,
      type: status === 'Cita agendada' ? ('appointment_booked' as const) : ('status_change' as const),
      title: status === 'Cita agendada' ? 'Cita Confirmada' : 'Actualización de CRM',
      message: notificationMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
      leadId: updatedLead.id
    };
    notifications.unshift(newNotification);
    writeData(NOTIFICATIONS_FILE, notifications);
  }

  res.json(updatedLead);
});

// Delete lead
app.delete('/api/leads/:id', (req: Request, res: Response) => {
  const leads = readData(LEADS_FILE, DEFAULT_LEADS);
  const { id } = req.params;

  const leadIndex = leads.findIndex(l => l.id === id);
  if (leadIndex === -1) {
    res.status(444).json({ error: 'Lead no encontrado' });
    return;
  }

  const deletedLeadName = leads[leadIndex].name;
  const filteredLeads = leads.filter(l => l.id !== id);
  writeData(LEADS_FILE, filteredLeads);

  // Add activity log
  const activities = readData(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  const newActivity = {
    id: `act-${Date.now()}`,
    leadId: 'sistema',
    leadName: deletedLeadName,
    action: 'Registro Eliminado',
    details: `Se eliminó el registro de paciente potencial: ${deletedLeadName}.`,
    timestamp: new Date().toISOString()
  };
  activities.unshift(newActivity);
  writeData(ACTIVITIES_FILE, activities);

  res.json({ success: true, id });
});

// Get Activity logs
app.get('/api/activities', (req: Request, res: Response) => {
  const activities = readData(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  res.json(activities);
});

// Get Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const notifications = readData(NOTIFICATIONS_FILE, DEFAULT_NOTIFICATIONS);
  res.json(notifications);
});

// Read notifications
app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const notifications = readData(NOTIFICATIONS_FILE, DEFAULT_NOTIFICATIONS);
  const updated = notifications.map(n => ({ ...n, isRead: true }));
  writeData(NOTIFICATIONS_FILE, updated);
  res.json(updated);
});

// Reset database
app.post('/api/reset', (req: Request, res: Response) => {
  writeData(LEADS_FILE, DEFAULT_LEADS);
  writeData(ACTIVITIES_FILE, DEFAULT_ACTIVITIES);
  writeData(NOTIFICATIONS_FILE, DEFAULT_NOTIFICATIONS);
  res.json({ success: true, message: 'Base de datos de prueba restaurada' });
});

// Secure Demo Login
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      user: {
        username: 'admin',
        role: 'Administrador Sede',
        name: 'Dr. Marco Aurelio (Multident SJL)',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
      },
      token: 'demo-jwt-token-multident-sjl'
    });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas. Use usuario: admin y clave: admin123 para propósitos de evaluación.' });
  }
});

// Serve Frontend using Vite Dev Middleware or production static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MULTIDENT] Fullstack server listening on http://localhost:${PORT}`);
  });
}

startServer();
