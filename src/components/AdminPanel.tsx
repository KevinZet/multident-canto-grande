/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  Bell, 
  Search, 
  SlidersHorizontal,
  LogOut, 
  Clock, 
  UserPlus, 
  PhoneCall, 
  Check, 
  X, 
  Star, 
  ShieldCheck, 
  Trash2, 
  RefreshCcw, 
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Info
} from 'lucide-react';
import { Lead, CRMStatus, QuickNotification, ActivityLog } from '../types';
import clinicLogo from '../assets/images/clinic_logo_1781594340090.jpg';

interface AdminPanelProps {
  onBackToWeb: () => void;
  lastUpdatedTime: number; // Used to trigger reload when a new lead lands from the public form
}

export default function AdminPanel({ onBackToWeb, lastUpdatedTime }: AdminPanelProps) {
  // Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // CRM state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<QuickNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<'leads' | 'appointments' | 'stats' | 'logs'>('leads');

  // Filters & Search
  const [leadsSearch, setLeadsSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CRMStatus | 'Todos'>('Todos');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Editing Note / Actions state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [actionComments, setActionComments] = useState('');
  const [editingLeadStatus, setEditingLeadStatus] = useState<CRMStatus>('Nuevo');

  // Reprogram Date & Time states
  const [reprogramDate, setReprogramDate] = useState('');
  const [reprogramTime, setReprogramTime] = useState('');

  // Manual Lead Creation state (for Walk-ins or Phone-in consultations)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualSpecialty, setManualSpecialty] = useState('Ortodoncia Especializada');
  const [manualComments, setManualComments] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('11:00');
  const [manualError, setManualError] = useState('');

  // Load leads, activities and alerts
  const loadCrmData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, actRes, notifRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/activities'),
        fetch('/api/notifications')
      ]);

      if (leadsRes.ok && actRes.ok && notifRes.ok) {
        const leadsData = await leadsRes.json();
        const actData = await actRes.json();
        const notifData = await notifRes.json();

        setLeads(leadsData);
        setActivities(actData);
        setNotifications(notifData);
      }
    } catch (error) {
      console.error('Error fetching CRM databases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Attempt local session loading
    const cachedToken = sessionStorage.getItem('multident_admin_token');
    const cachedUser = sessionStorage.getItem('multident_admin_user');
    if (cachedToken && cachedUser) {
      setIsAdminLoggedIn(true);
      setAdminUser(JSON.parse(cachedUser));
    }
  }, []);

  // Fetch data on login or on notification refresh triggers
  useEffect(() => {
    if (isAdminLoggedIn) {
      loadCrmData();
    }
  }, [isAdminLoggedIn, lastUpdatedTime]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Credenciales inválidas');
      }

      const result = await response.json();
      sessionStorage.setItem('multident_admin_token', result.token);
      sessionStorage.setItem('multident_admin_user', JSON.stringify(result.user));
      
      setAdminUser(result.user);
      setIsAdminLoggedIn(true);
      
      // Clear inputs
      setUsername('');
      setPassword('');
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('multident_admin_token');
    sessionStorage.removeItem('multident_admin_user');
    setIsAdminLoggedIn(false);
    setAdminUser(null);
  };

  // Status updates & comments handler
  const handleUpdateLeadStatus = async (leadId: string, status: CRMStatus, comments?: string) => {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actionComments: comments || actionComments,
          requestedDate: reprogramDate || undefined,
          requestedTime: reprogramTime || undefined
        })
      });

      if (response.ok) {
        const updatedLeadObj: Lead = await response.json();
        
        // Update local state and logs
        setLeads(prev => prev.map(l => l.id === leadId ? updatedLeadObj : l));
        
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(updatedLeadObj);
        }

        // Reload histories in background
        const actRes = await fetch('/api/activities');
        const notifRes = await fetch('/api/notifications');
        if (actRes.ok) setActivities(await actRes.json());
        if (notifRes.ok) setNotifications(await notifRes.json());

        // Reset editing state/controls
        setIsEditingStatus(false);
        setActionComments('');
        setReprogramDate('');
        setReprogramTime('');
      } else {
        alert('No se pudo actualizar el estado de lead militar.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Re-save lead completely
  const handleLeadReprogram = async (leadId: string, date: string, time: string) => {
    if (!date || !time) {
      alert('Favor seleccionar fecha y hora válida.');
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestedDate: date,
          requestedTime: time,
          actionComments: 'Fecha y hora reagendada desde el panel CRM.'
        })
      });

      if (response.ok) {
        const updatedLeadObj: Lead = await response.json();
        setLeads(prev => prev.map(l => l.id === leadId ? updatedLeadObj : l));
        
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(updatedLeadObj);
        }

        // Refresh database logs
        const actRes = await fetch('/api/activities');
        if (actRes.ok) setActivities(await actRes.json());

        alert('Reprogramación efectuada y grabada en el CRM.');
        setReprogramDate('');
        setReprogramTime('');
      }
    } catch (error) {
      console.error('Error in reprogram call:', error);
    }
  };

  // Hard delete a lead
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('¿Está completamente seguro de eliminar este registro del CRM de la clínica? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        if (selectedLead && selectedLead.id === leadId) {
          setSelectedLead(null);
        }
        
        // Refresh logging
        const actRes = await fetch('/api/activities');
        if (actRes.ok) setActivities(await actRes.json());
      } else {
        console.log('Error deleting record');
      }
    } catch (error) {
      console.error('Delete call failed:', error);
    }
  };

  // Reset database back to factory seeds
  const handleResetDatabase = async () => {
    if (!window.confirm('¿Desea restaurar los datos semilla iniciales de la clínica para demostración? Se borrará el historial de pruebas actual.')) {
      return;
    }

    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        loadCrmData();
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Reset database failed:', error);
    }
  };

  // Add Manual walk-in contact
  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    if (!manualName || !manualPhone) {
      setManualError('Nombre y teléfono son obligatorios.');
      return;
    }

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualName,
          phone: manualPhone,
          email: manualEmail,
          specialty: manualSpecialty,
          requestedDate: manualDate,
          requestedTime: manualTime,
          comments: manualComments || 'Registro manual tomado vía llamada/recepción.',
          source: 'whatsapp_click' // Standardized manual channel source
        })
      });

      if (response.ok) {
        // Clear manual structures
        setManualName('');
        setManualPhone('');
        setManualEmail('');
        setManualComments('');
        setIsManualModalOpen(false);

        // Reload listings
        loadCrmData();
      } else {
        const errorMsg = await response.json();
        setManualError(errorMsg.error || 'Ocurrió un error al grabar.');
      }
    } catch (error) {
      setManualError('Error de red al registrar.');
    }
  };

  // Mark all alert notifications as read
  const handleReadAllNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (response.ok) {
        const updated = await response.json();
        setNotifications(updated);
      }
    } catch (error) {
      console.log('Error reading alarm flags');
    }
  };

  // Calculations for stats dashboard
  const totalInquiries = leads.length;
  const totalAgendadas = leads.filter(l => l.status === 'Cita agendada').length;
  const totalContactados = leads.filter(l => l.status === 'Contactado' || l.status === 'En seguimiento').length;
  const totalNuevos = leads.filter(l => l.status === 'Nuevo').length;
  const totalPacientesReg = leads.filter(l => l.status === 'Paciente registrado').length;
  const totalCerrados = leads.filter(l => l.status === 'Cerrado').length;

  const activeAppointments = leads.filter(l => l.status === 'Cita agendada' || l.status === 'Nuevo');

  // Calculates conversion: Converted patients (Cita agendada + Paciente registrado) / Total Leads
  const conversionRate = totalInquiries > 0 
    ? Math.round(((totalPacientesReg + totalAgendadas) / totalInquiries) * 100) 
    : 0;

  // Filter listings based on select-filters
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(leadsSearch.toLowerCase()) || 
      l.phone.includes(leadsSearch) || 
      l.bookingCode.toLowerCase().includes(leadsSearch.toLowerCase()) ||
      l.specialty.toLowerCase().includes(leadsSearch.toLowerCase());
    
    if (statusFilter === 'Todos') return matchesSearch;
    return l.status === statusFilter && matchesSearch;
  });

  // Unique treatments distributions counts
  const treatmentCounts = leads.reduce((acc: any, curr) => {
    acc[curr.specialty] = (acc[curr.specialty] || 0) + 1;
    return acc;
  }, {});

  const maxTreatmentCount = Math.max(...(Object.values(treatmentCounts) as number[]), 1);

  // Status mapping colors helper
  const getStatusColor = (status: CRMStatus) => {
    switch (status) {
      case 'Nuevo':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'Contactado':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-250';
      case 'En seguimiento':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'Cita agendada':
        return 'bg-emerald-150 text-emerald-800 border border-emerald-200 bg-emerald-50';
      case 'Paciente registrado':
        return 'bg-sky-50 text-sky-800 border border-sky-200';
      case 'Cerrado':
        return 'bg-slate-200 text-slate-700 border border-slate-300';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div id="admin-panel-root" className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-[#0c2454] selection:text-white flex flex-col">
      
      {/* 🔐 AUTH LOGIN PORTAL VIEW */}
      {!isAdminLoggedIn ? (
        <div id="login-container" className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 border-b border-slate-900 min-h-screen">
          <div className="max-w-md w-full space-y-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden">
            
            <div className="text-center z-10 relative">
              <img 
                src={clinicLogo} 
                alt="Multident Canto Grande Logo" 
                className="mx-auto w-16 h-16 rounded-full object-cover shadow-lg border border-slate-700 mb-3"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-black text-white font-display">Portal Administrativo</h2>
              <p className="text-xs text-slate-400 mt-1 uppercase font-mono tracking-widest">MULTIDENT CANTO GRANDE CRM</p>
            </div>

            <div className="p-4 bg-sky-950/40 border border-sky-800/40 rounded-2xl space-y-1.5 text-xs text-sky-300">
              <p className="font-bold flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                Credenciales de Evaluación Demo:
              </p>
              <div className="font-mono">
                <p>• Usuario: <span className="text-white font-bold">admin</span></p>
                <p>• Contraseña: <span className="text-white font-bold">admin123</span></p>
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-800/30 text-rose-300 text-xs rounded-lg flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Usuario Sede</label>
                  <input
                    type="text"
                    required
                    placeholder="Ingrese su usuario..."
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">Contraseña Privada</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Autenticando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Ingresar al CRM
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBackToWeb}
                  className="w-full text-center py-2 text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                  Volver al sitio web de pacientes
                </button>
              </div>

            </form>

          </div>
        </div>
      ) : (
        
        // 💻 PRIMARY PRIVATE CRM AREA 
        <div id="crm-app-layout" className="flex-grow flex flex-col md:flex-row min-h-screen">
          
          {/* DASHBOARD COMPONENT SIDEBAR */}
          <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between border-r border-slate-855">
            
            <div>
              {/* Profile card / branding header */}
              <div className="p-5 border-b border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={clinicLogo} 
                    alt="Multident Canto Grande Logo" 
                    className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-inner"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-sm font-black font-display tracking-tight">MULTIDENT SJL</h3>
                    <p className="text-[9px] text-sky-400 font-mono tracking-widest uppercase">PANEL CRM ADMINISTRATIVO</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
                  <img 
                    className="w-9 h-9 rounded-full object-cover border border-sky-400/30" 
                    src={adminUser?.avatarUrl} 
                    alt="Perfil Administrador" 
                  />
                  <div className="grow overflow-hidden">
                    <p className="text-xs font-bold truncate text-slate-200">{adminUser?.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{adminUser?.role}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar Menu options */}
              <nav className="p-3 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-500 px-3 tracking-wider block mb-2">CRM de gestión</span>
                
                <button
                  onClick={() => { setCurrentTab('leads'); setSelectedLead(null); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold tracking-wide transition-all ${
                    currentTab === 'leads' 
                      ? 'bg-[#1a3f80] text-white shadow-md' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Users className="w-4.5 h-4.5" />
                  <span>Pacientes Potenciales ({leads.length})</span>
                </button>

                <button
                  onClick={() => { setCurrentTab('appointments'); setSelectedLead(null); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold tracking-wide transition-all ${
                    currentTab === 'appointments' 
                      ? 'bg-[#1a3f80] text-white shadow-md' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4.5 h-4.5" />
                  <span>Agenda de Citas ({leads.filter(l => l.status === 'Cita agendada').length})</span>
                </button>

                <button
                  onClick={() => setCurrentTab('stats')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold tracking-wide transition-all ${
                    currentTab === 'stats' 
                      ? 'bg-[#1a3f80] text-white shadow-md' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-4.5 h-4.5" />
                  <span>Rendimiento y Gráficos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('logs')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold tracking-wide transition-all ${
                    currentTab === 'logs' 
                      ? 'bg-[#1a3f80] text-white shadow-md' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>Historial de Logs ({activities.length})</span>
                </button>
              </nav>
            </div>

            {/* Logout and Database Restoration controls */}
            <div className="p-4 border-t border-slate-800 space-y-3">
              <button
                onClick={handleResetDatabase}
                className="w-full flex items-center justify-center gap-2 py-2 border border-slate-800 text-slate-400 hover:text-yellow-400 hover:border-yellow-450/40 rounded-lg text-[10px] uppercase tracking-wider transition-all font-mono"
                title="Restaurar base de datos simulada inicial"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Restaurar Semillas
              </button>

              <button
                onClick={onBackToWeb}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[11px] font-bold text-center block transition-all"
              >
                ← Ver Sitio Web
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-rose-450 hover:bg-rose-950/10 hover:text-rose-400 rounded-lg text-xs font-bold transition-all text-rose-350"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión Sede
              </button>
            </div>

          </aside>

          {/* MAIN PAGE CONTAINER */}
          <main className="flex-grow flex flex-col overflow-x-hidden">
            
            {/* Top Bar Header Area */}
            <header className="bg-white border-b border-slate-200 py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              <div>
                <h1 className="text-xl font-black text-slate-900 font-display">
                  {currentTab === 'leads' && 'Gestor CRM de Pacientes Potenciales'}
                  {currentTab === 'appointments' && 'Administración de Reservaciones de Citas'}
                  {currentTab === 'stats' && 'Reportes Estadísticos y Rendimiento'}
                  {currentTab === 'logs' && 'Logs de Auditoría en Tiempo Real'}
                </h1>
                <p className="text-xs text-slate-500">
                  Multident Sede Canto Grande, San Juan de Lurigancho • Gestión comercial digitalizada
                </p>
              </div>

              {/* Notification bell and utilities */}
              <div className="flex items-center gap-4">
                
                {/* Manual Lead registration action */}
                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="py-1.5 px-3.5 bg-[#0c2454] hover:bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-indigo-100"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Registro Manual
                </button>

                {/* Alarm indicators */}
                <div className="relative group">
                  <div className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer" onClick={handleReadAllNotifications}>
                    <Bell className="w-4 h-4" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold rounded-full text-[9px] flex items-center justify-center animate-bounce">
                        {notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </div>
                  
                  {/* Hover dropdown quick preview of notifications */}
                  <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2 z-50 hidden group-hover:block">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <strong className="text-xs text-slate-800">Alertas de CRM recientes</strong>
                      <button onClick={handleReadAllNotifications} className="text-[10px] text-sky-600 hover:underline">Marcar todo leido</button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-[10px] text-slate-400 py-4 text-center">No hay alarmas pendientes</p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            style={{ opacity: n.isRead ? 0.65 : 1 }}
                            className={`p-2 rounded text-[11px] leading-snug ${
                              n.type === 'new_lead' ? 'bg-blue-50 text-blue-900 border-l-2 border-blue-500' : 'bg-emerald-50 text-emerald-900 border-l-2 border-emerald-500'
                            }`}
                          >
                            <p className="font-bold">{n.title}</p>
                            <p className="text-slate-600 font-normal mt-0.5">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </header>

            {/* KEY METRICS SUMMARY STATS HEADER BAR */}
            <section id="metrics-grid" className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consultas Totales</span>
                  <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalInquiries}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Captación por Canales</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Citas Agendadas</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{totalAgendadas}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Listos para Asistir</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Conversión Comercial</span>
                  <p className="text-2xl font-black text-sky-600 mt-1 font-mono">{conversionRate}%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Nuevos Pacientes / Leads</p>
                </div>
                <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Leads en Seguimiento</span>
                  <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{totalContactados}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contactados & Espera</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

            </section>

            {/* TAB CONTENT ROOT */}
            <div className="px-6 pb-12 flex-grow">
              
              {isLoading ? (
                <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-4">
                  <span className="w-10 h-10 border-4 border-[#0c2454] border-t-transparent rounded-full animate-spin inline-block"></span>
                  <p className="text-xs text-slate-400 font-mono">Leyendo datos históricos de base de datos local...</p>
                </div>
              ) : (
                <>
                  
                  {/* TAB 1: PACIENTES POTENCIALES (CRM) */}
                  {currentTab === 'leads' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Table directory list */}
                      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                        
                        {/* Table actions bar */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                          
                          {/* Search Text Input */}
                          <div className="relative w-full sm:w-72">
                            <input
                              type="text"
                              placeholder="Buscar por nombre, código o móvil..."
                              value={leadsSearch}
                              onChange={e => setLeadsSearch(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-sky-500"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>

                          {/* Filter by Status Dropdown */}
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1 font-medium">
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              Filtro:
                            </span>
                            <select
                              value={statusFilter}
                              onChange={e => setStatusFilter(e.target.value as any)}
                              className="bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none focus:border-sky-500 grow sm:grow-0"
                            >
                              <option value="Todos">Todos los Estados ({leads.length})</option>
                              <option value="Nuevo">Nuevos ({leads.filter(l => l.status === 'Nuevo').length})</option>
                              <option value="Contactado">Contactados ({leads.filter(l => l.status === 'Contactado').length})</option>
                              <option value="En seguimiento">En Seguimiento ({leads.filter(l => l.status === 'En seguimiento').length})</option>
                              <option value="Cita agendada">Cita Agendada ({leads.filter(l => l.status === 'Cita agendada').length})</option>
                              <option value="Paciente registrado">Paciente Registrado ({leads.filter(l => l.status === 'Paciente registrado').length})</option>
                              <option value="Cerrado">Cerrados ({leads.filter(l => l.status === 'Cerrado').length})</option>
                            </select>
                          </div>

                        </div>

                        {/* Roster Listing Grid/Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <th className="p-3.5">Código</th>
                                <th className="p-3.5">Paciente Potencial</th>
                                <th className="p-3.5">Tratamiento de Interés</th>
                                <th className="p-3.5">Canal</th>
                                <th className="p-3.5">Estado</th>
                                <th className="p-3.5 text-right">Acción</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredLeads.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                                    No se encontraron pacientes potenciales que coincidan con la búsqueda.
                                  </td>
                                </tr>
                              ) : (
                                filteredLeads.map(l => (
                                  <tr 
                                    key={l.id} 
                                    onClick={() => {
                                      setSelectedLead(l);
                                      setEditingLeadStatus(l.status);
                                      setActionComments(l.actionComments || '');
                                    }}
                                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                                      selectedLead?.id === l.id ? 'bg-sky-50/40 relative font-medium border-l-2' : ''
                                    }`}
                                  >
                                    <td className="p-3.5 font-mono font-bold text-[#0c2454]">
                                      {l.bookingCode}
                                    </td>
                                    <td className="p-3.5">
                                      <p className="font-bold text-slate-900">{l.name}</p>
                                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{l.phone} • {l.email || 'Sin correo'}</p>
                                    </td>
                                    <td className="p-3.5">
                                      <p className="font-medium text-slate-750">{l.specialty}</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">Preferencia: {l.requestedDate} {l.requestedTime}</p>
                                    </td>
                                    <td className="p-3.5 font-sans font-medium text-[10px]">
                                      <span className={`px-2 py-0.5 rounded-full ${
                                        l.source === 'whatsapp_click' 
                                          ? 'bg-emerald-100 text-emerald-800' 
                                          : 'bg-purple-100 text-purple-800'
                                      }`}>
                                        {l.source === 'whatsapp_click' ? 'WhatsApp' : 'Formulario'}
                                      </span>
                                    </td>
                                    <td className="p-3.5">
                                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold font-mono ${getStatusColor(l.status)}`}>
                                        {l.status}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                                      <div className="flex justify-end gap-1.5">
                                        
                                        {/* Direct WhatsApp connector button */}
                                        <a
                                          href={`https://wa.me/${l.phone.startsWith('+') ? l.phone : '+51' + l.phone}?text=Hola%20${encodeURIComponent(l.name)}%2C%20le%20escribimos%20de%20Multident%20Canto%20Grande.%20Recibimos%20su%20solicitud%20para%20${encodeURIComponent(l.specialty)}.%20%C2%BFLe%20gustar%C3%ADa%20confirmar%20su%20visita%3F`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-1 px-1.5 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded text-[10px] font-bold flex items-center gap-1"
                                          title="Contactar vía WhatsApp"
                                        >
                                          <MessageSquare className="w-3.5 h-3.5 fill-green-700 text-white" />
                                          WhatsApp
                                        </a>
 
                                        {/* Scrap lead capability */}
                                        <button
                                          onClick={() => handleDeleteLead(l.id)}
                                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                          title="Eliminar registro"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
 
                      </div>
 
                      {/* Right: Detailed CRM work area selection */}
                      <div className="lg:col-span-4 select-none">
                        {selectedLead ? (
                          <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 space-y-4 animate-fade-in">
                            
                            {/* Card Header details */}
                            <div className="pb-3.5 border-b border-slate-100 flex items-start justify-between">
                              <div>
                                <span className="text-[10px] font-mono uppercase bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded">
                                  {selectedLead.bookingCode}
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-2 font-display">{selectedLead.name}</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Registrado el {new Date(selectedLead.createdAt).toLocaleString()}</p>
                              </div>
                              <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-semibold ${getStatusColor(selectedLead.status)}`}>
                                {selectedLead.status}
                              </span>
                            </div>
 
                            {/* Contact indices */}
                            <div className="space-y-2 text-xs">
                              <p className="flex justify-between">
                                <span className="text-slate-400">Teléfono:</span>
                                <strong className="text-slate-800 font-mono">{selectedLead.phone}</strong>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Correo:</span>
                                <strong className="text-slate-800 truncate max-w-[180px]">{selectedLead.email || 'N/A'}</strong>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Especialidad:</span>
                                <strong className="text-sky-600 font-medium">{selectedLead.specialty}</strong>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Canal de Ingreso:</span>
                                <strong className="text-slate-700 capitalize">{selectedLead.source === 'whatsapp_click' ? 'WhatsApp Directo' : 'Formulario Web'}</strong>
                              </p>
                              <p className="flex justify-between">
                                <span className="text-slate-400">Fecha Estimada:</span>
                                <strong className="text-slate-800 font-mono">{selectedLead.requestedDate} a las {selectedLead.requestedTime}</strong>
                              </p>
                            </div>
 
                            {/* Clinical annotations block */}
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs">
                              <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">Comentarios del Paciente:</strong>
                              <p className="text-slate-600 italic font-normal">
                                "{selectedLead.comments || 'Sin comentarios adicionales.'}"
                              </p>
                            </div>
 
                            {/* Admin interactive annotations block */}
                            <div className="p-3 bg-sky-50/40 border border-sky-100/50 rounded-xl space-y-2 text-xs">
                              <strong className="text-sky-800 block text-[11px] uppercase tracking-wide">Bitácora Interna / Notas CRM:</strong>
                              <p className="text-slate-700 font-normal">
                                {selectedLead.actionComments ? selectedLead.actionComments : 'Sin notas internas. Use los controles inferiores para asentar llamadas y gestiones.'}
                              </p>
                            </div>
 
                            {/* CRM status controls */}
                            <div className="space-y-3 pt-3 border-t border-slate-100">
                              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Actualizar Gestión CRM</h4>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleUpdateLeadStatus(selectedLead.id, 'Contactado')}
                                    className="p-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded text-[11px] font-bold text-center block"
                                  >
                                    Llamar / Contactar
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLeadStatus(selectedLead.id, 'Cita agendada')}
                                    className="p-1.5 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded text-[11px] font-bold text-center block"
                                  >
                                    Agendar Cita
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLeadStatus(selectedLead.id, 'Paciente registrado')}
                                    className="p-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-[11px] font-bold text-center block"
                                  >
                                    Dar de Alta
                                  </button>
                                  <button
                                    onClick={() => handleUpdateLeadStatus(selectedLead.id, 'Cerrado')}
                                    className="p-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold text-center block"
                                  >
                                    Cerrado / Desistir
                                  </button>
                                </div>
 
                                {/* Custom notes injection form */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-mono text-slate-400 block">Comentarios del Clinico:</label>
                                  <textarea
                                    value={actionComments}
                                    onChange={e => setActionComments(e.target.value)}
                                    placeholder="Ingrese detalles del contacto, estado del niño, facilidades de pago que requiere..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-sky-500"
                                    style={{ height: '60px' }}
                                  />
                                </div>

                                <button
                                  onClick={() => handleUpdateLeadStatus(selectedLead.id, selectedLead.status, actionComments)}
                                  className="w-full py-1.5 bg-[#0c2454] text-white rounded-lg text-xs font-bold"
                                >
                                  Grabar Bitácora Interna
                                </button>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-2xl text-center text-slate-400 space-y-2">
                            <Info className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-mono">Seleccione un paciente de la lista de la izquierda para desplegar sus datos, actualizar bitácora odontológica y cambiar estados del CRM.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* TAB 2: AGENDAS DE CITAS */}
                  {currentTab === 'appointments' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left side scheduler */}
                      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
                        
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <h3 className="text-base font-black text-[#0c2454]">Próximas Visitas programadas</h3>
                            <p className="text-xs text-slate-500">Filtrado por confirmaciones de agenda vigentes</p>
                          </div>
                          
                          <div className="text-xs text-slate-500 font-mono">
                            Sede Canto Grande Activa • <span className="font-bold text-emerald-600">Lunes a Sábado</span>
                          </div>
                        </div>

                        {activeAppointments.length === 0 ? (
                          <div className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-xl">
                            No existen citas registradas en rango. Presione "Registro Manual" para asentar un contacto presencial en consultorio.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeAppointments.map(a => (
                              <div 
                                key={a.id} 
                                className={`p-4 border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                                  a.status === 'Cita agendada' 
                                    ? 'bg-emerald-50/20 border-emerald-150 shadow-xs' 
                                    : 'bg-white border-slate-200/90'
                                }`}
                              >
                                
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded">
                                      {a.bookingCode}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-850 font-display">{a.name}</h4>
                                    <span className={`px-2 py-0.2 text-[9px] rounded-full font-semibold font-mono ${getStatusColor(a.status)}`}>
                                      {a.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 font-mono">
                                    🦷 Tratamiento solicitado: <span className="font-bold text-slate-700">{a.specialty}</span>
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    📞 Teléfono de contacto: <span className="font-bold text-slate-700 font-mono">{a.phone}</span>
                                  </p>
                                  {a.comments && (
                                    <p className="text-[11px] text-slate-400 italic max-w-sm truncate">
                                      "{a.comments}"
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                                  
                                  {/* Appointment Time Tag */}
                                  <div className="flex items-center gap-1 text-xs text-indigo-750 font-bold bg-indigo-50 border border-indigo-100 py-1 px-2.5 rounded-lg w-fit">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>{a.requestedDate} • {a.requestedTime} Hs</span>
                                  </div>

                                  {/* Mini Rescheduler form */}
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => {
                                        setSelectedLead(a);
                                        setReprogramDate(a.requestedDate);
                                        setReprogramTime(a.requestedTime);
                                      }}
                                      className="py-1 px-2.5 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-[#0c2454] rounded text-[10px] font-bold"
                                    >
                                      Reprogramar
                                    </button>
                                    
                                    {a.status !== 'Cita agendada' && (
                                      <button
                                        onClick={() => handleUpdateLeadStatus(a.id, 'Cita agendada', 'Consulta autorizada y agendada mediante calendario de operaciones')}
                                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                                      >
                                        Confirmar Cita
                                      </button>
                                    )}
                                  </div>

                                </div>

                              </div>
                            ))}
                          </div>
                        )}

                      </div>

                      {/* Right Reprogram control area panel */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5">
                            Modificar Horarios de Reserva
                          </h3>
                          
                          {selectedLead ? (
                            <form 
                              className="space-y-4"
                              onSubmit={e => {
                                e.preventDefault();
                                handleLeadReprogram(selectedLead.id, reprogramDate, reprogramTime);
                              }}
                            >
                              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                                <span className="text-[10px] font-mono text-slate-400">Paciente a reprogramar:</span>
                                <p className="text-xs font-bold text-slate-800">{selectedLead.name}</p>
                                <p className="text-[11px] text-sky-600">{selectedLead.specialty}</p>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 block uppercase">Nueva Fecha:</label>
                                <input
                                  type="date"
                                  required
                                  min={new Date().toISOString().split('T')[0]}
                                  value={reprogramDate}
                                  onChange={e => setReprogramDate(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 block uppercase">Nueva Hora:</label>
                                <input
                                  type="time"
                                  required
                                  value={reprogramTime}
                                  onChange={e => setReprogramTime(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                                />
                              </div>

                              <button
                                type="submit"
                                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full text-xs cursor-pointer"
                              >
                                Guardar Reprogramación
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedLead(null)}
                                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-655"
                              >
                                Cancelar acción
                              </button>
                            </form>
                          ) : (
                            <div className="py-8 text-center text-xs text-slate-400 font-mono">
                              Seleccione "Reprogramar" en una cita para cambiar su cronograma.
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: RENDIMIENTO Y GRAFICOS */}
                  {currentTab === 'stats' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
                      
                      <div>
                        <h3 className="text-base font-black text-[#0c2454]">Indicadores Mensuales y Fuentes Comerciales</h3>
                        <p className="text-xs text-slate-500">Reporte dinámico calculado con datos locales reales del CRM.</p>
                      </div>

                      {/* Graphic 1: Distribution of Treatments (Custom pristine interactive inline SVG bar charts) */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Interactive analytical SVG bars chart rendering */}
                        <div className="lg:col-span-8 space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Distribución de Consultas por Tratamiento Odontológico</h4>
                          
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                            {Object.keys(treatmentCounts).length === 0 ? (
                              <p className="text-xs text-slate-400 font-mono text-center py-10">No hay información suficiente para estructurar gráficos.</p>
                            ) : (
                              Object.entries(treatmentCounts).map(([treat, count]: any) => {
                                const percentage = Math.round((count / maxTreatmentCount) * 100);
                                return (
                                  <div key={treat} className="space-y-1.5">
                                    <div className="flex justify-between text-xs">
                                      <span className="font-bold text-slate-700">{treat}</span>
                                      <span className="font-mono text-slate-450">{count} consultas ({Math.round((count/totalInquiries)*100)}%)</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                                      <div 
                                        style={{ width: `${percentage}%` }}
                                        className="h-full bg-gradient-to-r from-[#0c2454] to-sky-500 rounded-full transition-all duration-500"
                                      />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* Right: Legend metrics and indicators calculations */}
                        <div className="lg:col-span-4 space-y-6">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Conversiones por Estado CRM</h4>
                          
                          <div className="space-y-3.5">
                            
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Nuevos
                              </span>
                              <span className="font-bold text-xs text-slate-800 font-mono">{totalNuevos} ({totalInquiries > 0 ? Math.round((totalNuevos/totalInquiries)*100) : 0}%)</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Contactados
                              </span>
                              <span className="font-bold text-xs text-slate-800 font-mono">{totalContactados} ({totalInquiries > 0 ? Math.round((totalContactados/totalInquiries)*100) : 0}%)</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Citas Agendadas
                              </span>
                              <span className="font-bold text-xs text-slate-805 font-mono">{totalAgendadas} ({totalInquiries > 0 ? Math.round((totalAgendadas/totalInquiries)*100) : 0}%)</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> Pacientes Registrados
                              </span>
                              <span className="font-bold text-xs text-slate-800 font-mono">{totalPacientesReg} ({totalInquiries > 0 ? Math.round((totalPacientesReg/totalInquiries)*100) : 0}%)</span>
                            </div>

                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" /> Cerrados
                              </span>
                              <span className="font-bold text-xs text-slate-800 font-mono">{totalCerrados} ({totalInquiries > 0 ? Math.round((totalCerrados/totalInquiries)*100) : 0}%)</span>
                            </div>

                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* TAB 4: HISTORIAL DE LOGS */}
                  {currentTab === 'logs' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      
                      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-black text-slate-900">Bitácora de Auditoría Clínica</h3>
                          <p className="text-xs text-slate-500">Historial secuencial de cambios de estado, reprogramaciones e inscripciones web</p>
                        </div>
                        <span className="text-[10px] bg-sky-100 text-sky-800 py-1 px-2.5 rounded-md font-mono">Sede Canto Grande</span>
                      </div>

                      {activities.length === 0 ? (
                        <p className="py-12 text-center text-slate-400 font-mono text-xs">No hay actividad registrada en la base de datos.</p>
                      ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {activities.map(act => (
                            <div key={act.id} className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-1.5 rounded-xl text-xs flex items-start justify-between gap-4 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 font-display">{act.action}</span>
                                  <span className="text-[10px] text-slate-400">•</span>
                                  <span className="text-sky-700 font-semibold">{act.leadName}</span>
                                </div>
                                <p className="text-slate-650 font-normal">{act.details}</p>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {new Date(act.timestamp).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  )}

                </>
              )}

            </div>

          </main>

        </div>
      )}

      {/* 🛑 MANUAL LEAD CREATION MODAL REPRESENTATION */}
      {isManualModalOpen && (
        <div id="manual-modal" className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 relative shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-150 pb-3">
              <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-sky-600" />
                Registrar Paciente Potencial Manualmente
              </h3>
              <button 
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <p className="text-xs text-rose-600 font-mono p-2 bg-rose-50 border border-rose-100 rounded-lg">
                ⚠️ {manualError}
              </p>
            )}

            <form onSubmit={handleCreateManualLead} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wide block">Nombre del Paciente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan de Dios Huamán"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wide block">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 900221144"
                    value={manualPhone}
                    onChange={e => setManualPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wide block">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={manualEmail}
                    onChange={e => setManualEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wide block">Tratamiento e Interés</label>
                  <select
                    value={manualSpecialty}
                    onChange={e => setManualSpecialty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  >
                    <option value="Ortodoncia Especializada">Ortodoncia Especializada</option>
                    <option value="Implantes Dentales">Implantes Dentales</option>
                    <option value="Endodoncia Avanzada">Endodoncia Avanzada</option>
                    <option value="Rehabilitación Oral">Rehabilitación Oral</option>
                    <option value="Odontopediatría Integral">Odontopediatría Integral</option>
                    <option value="Blanqueamiento Dental LED">Blanqueamiento Dental LED</option>
                    <option value="Estética Dental y Carillas">Estética Dental y Carillas</option>
                    <option value="Cirugía Oral e Implantes">Cirugía Oral e Implantes</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wide block">Fecha Tentativa</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 uppercase tracking-wide block">Hora Tentativa</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-slate-500 uppercase tracking-wide block">Anotaciones iniciales de la llamada / recepción:</label>
                <textarea
                  rows={2}
                  placeholder="Ej. Paciente llamó consultando precio. Refiere dolor en muela. Desea iniciar evaluación mañana."
                  value={manualComments}
                  onChange={e => setManualComments(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="grow py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full text-xs text-center block cursor-pointer"
                >
                  Registrar de Inmediato
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-full text-xs text-center block animate-pulse cursor-pointer"
                >
                  Regresar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
