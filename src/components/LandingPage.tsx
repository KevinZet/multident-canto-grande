/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  PlusCircle, 
  Activity, 
  Grid, 
  Heart, 
  Sun, 
  Shield, 
  Users, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronDown, 
  Calendar, 
  Check, 
  CheckCircle, 
  Menu, 
  X, 
  ExternalLink,
  MessageCircle,
  Star,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { TREATMENTS } from '../data/treatments';
import { Lead } from '../types';
import clinicLogo from '../assets/images/clinic_logo_1781594340090.jpg';
import patientAvatar1 from '../assets/images/patient-avatar-1.jpg';
import patientAvatar2 from '../assets/images/patient-avatar-2.jpg';
import patientAvatar3 from '../assets/images/patient-avatar-3.jpg';
import drMarco from '../assets/images/dr-marco.jpg';
import draAngela from '../assets/images/dra-angela.jpg';
import drRoberto from '../assets/images/dr-roberto.jpg';
import draJimena from '../assets/images/dra-jimena.jpg';
import consultorio from '../assets/images/consultorio.jpg';
import sillaDiagnostico from '../assets/images/silla-diagnostico.jpg';
import esterilizacion from '../assets/images/esterilizacion.jpg';
import recepcion from '../assets/images/recepcion.jpg';

interface LandingPageProps {
  onAdminClick: () => void;
  onNewLeadRegistered: () => void;
}

export default function LandingPage({ onAdminClick, onNewLeadRegistered }: LandingPageProps) {
  // Navigation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Active treatment tab
  const [selectedTreatmentId, setSelectedTreatmentId] = useState(TREATMENTS[0].id);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: TREATMENTS[0].title,
    requestedDate: '',
    requestedTime: '10:00',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successLead, setSuccessLead] = useState<Lead | null>(null);
  const [formError, setFormError] = useState('');

  // Active FAQ accordion index
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Track page scroll for header styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update default specialty if the user chooses one via CTA
  const handleSelectSpecialtyCTA = (treatmentTitle: string) => {
    setFormData(prev => ({ ...prev, specialty: treatmentTitle }));
    const formElement = document.getElementById('reservar-cita');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit appointment lead to API
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    setSuccessLead(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          source: 'web_form'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo registrar la cita. Verifique los datos.');
      }

      const registeredLeadObj: Lead = await response.json();
      setSuccessLead(registeredLeadObj);
      onNewLeadRegistered(); // Notify parent to refresh notifications/logs in background
      
      // Clear form
      setFormData({
        name: '',
        phone: '',
        email: '',
        specialty: TREATMENTS[0].title,
        requestedDate: '',
        requestedTime: '10:00',
        comments: ''
      });
    } catch (error: any) {
      setFormError(error.message || 'Error de conexión. Inténtelo más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsappQuickClick = () => {
    // Record log via background action before redirect (standard design pattern)
    fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Interesado WhatsApp Anon',
        phone: '908874468',
        specialty: 'Atención WhatsApp',
        comments: 'Clic direct en enlace WhatsApp de la Landing',
        source: 'whatsapp_click'
      })
    }).catch(e => console.log('Silent WA lead logged'));
    
    // Open WA Link
    const waUrl = 'https://wa.me/51908874468?text=Hola%20Multident%20Canto%20Grande%2C%20deseo%20m%C3%A1s%20informaci%C3%B3n%20sobre%20las%20especialidades%20y%20agendar%20una%20cita%20de%20evaluaci%C3%B3n.';
    window.open(waUrl, '_blank');
  };

  const handleWhatsappSuccessConfirm = (lead: Lead) => {
    const textPrefill = `Hola Multident Canto Grande, acabo de reservar una cita mediante la web. Código de reserva: ${lead.bookingCode}. Mi nombre es ${lead.name} y mi cita está programada para el ${lead.requestedDate} a las ${lead.requestedTime} para ${lead.specialty}. Confirmo mi disponibilidad.`;
    const waUrl = `https://wa.me/51908874468?text=${encodeURIComponent(textPrefill)}`;
    window.open(waUrl, '_blank');
  };

  const selectedTreatment = TREATMENTS.find(t => t.id === selectedTreatmentId) || TREATMENTS[0];

  const faqs = [
    {
      q: '¿Cómo reservo mi primera consulta en Multident Canto Grande?',
      a: 'Puedes hacerlo fácilmente a través de nuestro formulario de reserva en línea aquí mismo en la web, seleccionando tu fecha, hora y tratamiento deseado. Tras enviarlo, el sistema te asignará un código único y podrás confirmar por WhatsApp al instante. También atendemos directamente llamando o escribiendo al WhatsApp +51 908 874 468.'
    },
    {
      q: '¿Es mi primera cita diagnóstica gratuita?',
      a: 'Contamos con campañas especiales mensuales de diagnóstico integral para nuevos pacientes en Canto Grande. Por lo general, incluye evaluación odontológica digital, odontograma interactivo coordinado y la formulación del plan de tratamiento personalizado por solo S/. 30. ¡Consulta los beneficios de la campaña por WhatsApp!'
    },
    {
      q: '¿Qué formas de pago aceptan en la sede?',
      a: 'Ofrecemos todas las facilidades de pago para tu comodidad: Efectivo, tarjetas de crédito/débito (Visa, Mastercard, Amex), transferencias directas (BCP, BBVA, Interbank) y aplicativos móviles como Yape y Plin sin recargos. Adicionalmente, contamos con planes de financiamiento fraccionado para tratamientos de Ortodoncia e Implantes.'
    },
    {
      q: '¿Qué diferencia a Multident Canto Grande de otras clínicas?',
      a: 'Somos una sede con certificación de alta calidad Multident. Destacamos por contar con especialistas colegiados formados en las mejores universidades, tecnología rotatoria y digital de última gama, estrictos protocolos de bioseguridad, atención Pet Friendly, y una ubicación estratégica con ambientes súper cómodos diseñados para toda la familia en San Juan de Lurigancho.'
    },
    {
      q: '¿Atienden emergencias dentales?',
      a: 'Sí, contamos con atención de urgencias dentales durante nuestro horario de atención habitual (Lunes a Sábado de 9:00 AM a 8:00 PM). Si tienes un dolor intenso de muela, sangrado, o sufriste un golpe fuerte, escríbenos directamente al WhatsApp para priorizar tu turno.'
    }
  ];

  // Helper mapping icon key to component
  const getTreatmentIcon = (name: string) => {
    switch(name) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-sky-600" />;
      case 'PlusCircle': return <PlusCircle className="w-5 h-5 text-sky-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-sky-600" />;
      case 'Grid': return <Grid className="w-5 h-5 text-sky-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-sky-600" />;
      case 'Sun': return <Sun className="w-5 h-5 text-sky-600" />;
      case 'Shield': return <Shield className="w-5 h-5 text-sky-600" />;
      default: return <Users className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div id="landing-root" className="min-h-screen bg-slate-50 font-sans text-slate-850 antialiased selection:bg-sky-500 selection:text-white">
      
      {/* LOCAL SEO BANNER (Micro-copy matching requested local search patterns) */}
      <div id="seo-bar" className="bg-[#0c2454] text-sky-200 text-xs py-1.5 px-4 text-center border-b border-[#143270] font-mono tracking-wide">
        📍 Clinica Dental Canto Grande, San Juan de Lurigancho — Ortodoncia, Implantes y Odontopediatría en SJL. Atencion Pet Friendly de Lunes a Sabado.
      </div>

      {/* HEADER NAVBAR */}
      <header 
        id="navbar-header"
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white shadow-md py-3 border-b border-slate-100' 
            : 'bg-white/95 backdrop-blur-md py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand Representation replicating the real corporate style */}
          <div id="logo-brand" className="flex items-center gap-3 cursor-pointer">
            <img 
              src={clinicLogo} 
              alt="Multident Canto Grande Logo" 
              className="w-11 h-11 rounded-full object-cover shadow-md border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-sky-900 tracking-tight font-display">MULTIDENT</span>
                <span className="text-xs font-bold text-sky-600 font-mono">SJL</span>
              </div>
              <p className="text-[9px] text-slate-400 tracking-widest uppercase font-semibold">CANTO GRANDE</p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-7">
            <a href="#inicio" className="text-slate-600 hover:text-sky-600 text-sm font-semibold transition-colors">Inicio</a>
            <a href="#tratamientos" className="text-slate-600 hover:text-sky-600 text-sm font-semibold transition-colors">Especialidades</a>
            <a href="#por-que-elegirnos" className="text-slate-600 hover:text-sky-600 text-sm font-semibold transition-colors">Nosotros</a>
            <a href="#equipo" className="text-slate-600 hover:text-sky-600 text-sm font-semibold transition-colors">Médicos</a>
            <a href="#preguntas" className="text-slate-600 hover:text-sky-600 text-sm font-semibold transition-colors">Preguntas</a>
            <a href="#contacto" className="text-slate-600 hover:text-sky-600 text-sm font-semibold transition-colors">Ubicación</a>
          </nav>

          {/* Action buttons on desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              id="btn-nav-admin"
              onClick={onAdminClick}
              className="px-4 py-2 border border-slate-200 text-sky-700 bg-sky-50/50 hover:bg-sky-50 rounded-full text-xs font-bold tracking-wider transition-all"
            >
              ACCESO PORTAL
            </button>
            <a 
              href="#reservar-cita"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold shadow-lg shadow-sky-100 hover:shadow-xl transition-all"
            >
              RESERVAR CITA
            </a>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={onAdminClick}
              className="text-xs font-bold text-slate-500 border border-slate-200 rounded px-2 py-1"
            >
              ACCESO
            </button>
            <button 
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-sky-600 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div id="mobile-menu-panel" className="md:hidden bg-white border-b border-slate-200 pt-2 pb-6 px-4 space-y-3 shadow-lg absolute w-full left-0 transition-all duration-200">
            <a 
              href="#inicio" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
            >
              Inicio
            </a>
            <a 
              href="#tratamientos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
            >
              Especialidades y Tratamientos
            </a>
            <a 
              href="#por-que-elegirnos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
            >
              ¿Por qué elegirnos?
            </a>
            <a 
              href="#equipo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
            >
              Nuestro Equipo Médico
            </a>
            <a 
              href="#preguntas" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
            >
              Preguntas Frecuentes
            </a>
            <a 
              href="#contacto" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 hover:bg-slate-50 text-slate-700 font-medium rounded-lg"
            >
              Contacto y Horarios
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAdminClick();
                }}
                className="w-full text-center py-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-bold hover:bg-slate-50"
              >
                Panel Administrador CRM
              </button>
              <a 
                href="#reservar-cita"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-sm font-bold block"
              >
                Reservar Cita Online
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 1. HERO SECTION */}
      <section id="inicio" className="relative bg-gradient-to-br from-white to-sky-50/20 pt-8 pb-16 md:py-24 overflow-hidden border-b border-slate-200">
        
        {/* Soft abstract background blobs */}
        <div className="absolute right-0 top-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-sky-100/30 blur-3xl -z-10"></div>
        <div className="absolute left-10 bottom-0 w-[500px] h-[500px] rounded-full bg-blue-50/40 blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-sky-50 border border-sky-100 text-sky-850 rounded-full text-xs font-bold w-fit tracking-wide animate-pulse">
                <Sparkle className="w-4 h-4 fill-sky-600 text-sky-600" />
                <span>TECNOLOGÍA ODONTOLÓGICA DE VANGUARDIA</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-sky-950 leading-tight tracking-tight font-display">
                Tu sonrisa merece <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-sky-500 italic">atención especializada</span> de confianza
              </h1>

              <p className="text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
                En <strong>Multident Canto Grande</strong>, redefinimos la experiencia odontológica en San Juan de Lurigancho. Combinamos profesionales altamente especializados con tecnología 3D de punta y una cálida atención pet friendly para cuidar la salud de toda tu familia.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <a 
                  href="#reservar-cita"
                  className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-full text-center shadow-lg shadow-sky-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4.5 h-4.5 text-sky-200" />
                  RESERVAR CITA ONLINE
                </a>
                
                <button 
                  onClick={handleWhatsappQuickClick}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-750 text-white text-sm font-bold rounded-full text-center shadow-lg shadow-emerald-100 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4.5 h-4.5 fill-white text-emerald-600" />
                  WHATSAPP DIRECTO
                </button>
              </div>

              {/* Trust Indicators block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-sky-50 rounded text-sky-600 shrink-0">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Especialistas</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Médicos Colegiados</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 bg-sky-50 rounded text-sky-600 shrink-0">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Atención Cálida</h4>
                    <p className="text-[10px] text-slate-500 font-medium">100% Personalizada</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 bg-sky-50 rounded text-sky-600 shrink-0">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Tecnología 3D</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Equipamiento Láser</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="p-1 bg-sky-50 rounded text-sky-600 shrink-0">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Sede SJL Sólida</h4>
                    <p className="text-[10px] text-slate-500 font-medium font-sans">Amplia experiencia</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Display Media Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Visual decorative circles/frames for medical look */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-sky-200 to-sky-100 rounded-2xl rotate-3 -z-10 opacity-60"></div>
                
                {/* Main illustration card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col space-y-4">
                  <div className="h-56 bg-gradient-to-br from-[#0c2454] to-[#1a3f80] rounded-xl flex flex-col justify-between p-6 text-white relative">
                    <div className="absolute top-4 right-4 text-sky-400 opacity-25">
                      <Sparkles className="w-20 h-20" />
                    </div>
                    
                    <div className="flex justify-between items-start z-10">
                      <div className="px-2.5 py-1 bg-sky-500/20 text-sky-100 border border-sky-400/30 rounded text-[10px] font-mono">
                        SEDE CANTO GRANDE
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>

                    <div className="z-10 space-y-1">
                      <h3 className="text-xl font-bold font-display leading-tight">Clínica Multident</h3>
                      <p className="text-xs text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-400" /> Av. Canto Grande 3636, SJL
                      </p>
                    </div>

                    <div className="flex justify-between items-center z-10 pt-4 border-t border-white/10 text-[11px] text-slate-300">
                      <span>Lunes - Sábado</span>
                      <span className="font-bold text-white">9:00 AM - 8:00 PM</span>
                    </div>
                  </div>

                  {/* Trust widget badge */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="grow">
                      <p className="text-xs font-bold text-slate-850">Odontología Amigable</p>
                      <p className="text-[11px] text-slate-500">Sello Pet Friendly en Canto Grande</p>
                    </div>
                    <span className="text-xs font-bold text-[#25d366] bg-green-50 border border-green-100 px-2 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                      Activo
                    </span>
                  </div>

                  {/* Active patient feedback */}
                  <div className="flex gap-3 items-center pt-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={patientAvatar1} alt="Paciente" />
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={patientAvatar2} alt="Paciente" />
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={patientAvatar3} alt="Paciente" />
                    </div>
                    <p className="text-xs text-slate-500">
                      Más de <strong className="text-slate-800">1,500 familias de SJL</strong> confían en nosotros.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. ESPECIALIDADES Y TRATAMIENTOS SECTION */}
      <section id="tratamientos" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section title */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-sky-600 uppercase mb-2">Salud Oral de Excelencia</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0c2454] font-display">Nuestras Especialidades y Tratamientos</h3>
            <p className="text-sm text-slate-600 mt-3 max-w-2xl mx-auto">
              Brindamos soluciones integrales de diagnóstico, prevención y estética con especialistas dedicados exclusivamente a cada rama odontológica.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Vertical tab list */}
            <div id="treatments-tabs" className="lg:col-span-4 flex flex-col gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm max-h-[500px] overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-3 pt-2 pb-1 tracking-wider">Tratamientos Disponibles</span>
              {TREATMENTS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTreatmentId(t.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-xl text-left font-semibold text-sm transition-all focus:outline-none ${
                    selectedTreatmentId === t.id 
                      ? 'bg-[#1a3f80] text-white shadow-md' 
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${selectedTreatmentId === t.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedTreatmentId === t.id ? <Check className="w-4 h-4 text-sky-200" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <span className="grow truncate">{t.title}</span>
                </button>
              ))}
            </div>

            {/* Right Column: Detailed Treatment Card */}
            <div id="treatment-detail-pane" className="lg:col-span-8">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                
                {/* Background glow icon */}
                <div className="absolute top-6 right-6 opacity-[0.03] -z-10 pointer-events-none">
                  <Activity className="w-64 h-64 text-slate-900" />
                </div>

                <div className="space-y-4">
                  {/* Title and Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-sky-100 text-sky-900 rounded-xl">
                        {getTreatmentIcon(selectedTreatment.iconName)}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">{selectedTreatment.title}</h3>
                        <p className="text-[11px] text-slate-400 font-mono tracking-wide uppercase">Cuidado Profesional Sello Multident</p>
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <span className="text-xs text-slate-400 block font-mono">Inversión Estimada</span>
                      <span className="text-sm font-bold text-sky-700 font-mono">{selectedTreatment.estimatedCostRange}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {selectedTreatment.description}
                  </p>

                  {/* Benefits checklist */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 tracking-wide uppercase mb-3">Beneficios Principales del Tratamiento</h5>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTreatment.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle className="w-4.5 h-4.5 text-sky-600 fill-sky-50 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metadata Tech details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs mt-4">
                    <div>
                      <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">Tecnología Sede:</strong>
                      <span className="text-slate-600">{selectedTreatment.technology}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">Tiempo de tratamiento:</strong>
                      <span className="text-slate-600">{selectedTreatment.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Call to action for selected treatment */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-6 md:mt-0">
                  <p className="text-xs text-slate-500 italic max-w-sm text-center sm:text-left">
                    *Todos los precios de referencia varían de acuerdo a la evaluación clínica individual y recomendación del especialista.
                  </p>
                  
                  <button
                    onClick={() => handleSelectSpecialtyCTA(selectedTreatment.title)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0c2454] hover:bg-slate-900 text-white rounded-lg text-sm font-bold shadow transition-all flex items-center justify-center gap-2"
                  >
                    Reserva este tratamiento
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. POR QUÉ ELEGIRNOS SECTION */}
      <section id="por-que-elegirnos" className="py-16 md:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Grid of features */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Experiencia Comprobada</h4>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Contamos con profesionales altamente especializados, de sólida formación y constantemente actualizados en el gremio nacional.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Tecnología Dental</h4>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Diagnóstico avanzado digital, radiografías integradas y aparatología rotatoria de última gama en Canto Grande.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5 text-sky-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Protocolo Pet Friendly</h4>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Entendemos el rol de tu mascota en la familia. Bienvenidos bajo protocolos coordinados para tu total tranquilidad.
                </p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 font-display">Protocolo de Bioseguridad</h4>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Estándares internacionales de esterilización y bioseguridad para garantizar un entorno libre de riesgos sanitarios.
                </p>
              </div>

            </div>

            {/* Right side: Summary stats & values */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-2.5 bg-sky-50 border border-sky-100 text-sky-900 text-xs font-bold rounded-lg w-fit">
                NUESTROS DIFERENCIADORES
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display leading-tight">
                Dedicados a cuidar <br />
                <span className="text-sky-600">cada detalle</span> de tu salud bucal
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                En la sede Multident Canto Grande, hemos diseñado cada espacio pensando en tu bienestar y en el de tus seres queridos. Elimina el miedo clásico a las visitas al dentista con nuestras técnicas de sedación consciente óxido nitroso y trato empático personalizado.
              </p>

              {/* Numerical milestones */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100 font-display">
                <div>
                  <span className="text-4xl font-black text-[#0c2454]">100%</span>
                  <p className="text-xs font-bold text-slate-850 mt-1">Garantiza Recomendación</p>
                  <p className="text-[10px] text-slate-500">14 opiniones de Google Maps</p>
                </div>
                <div>
                  <span className="text-4xl font-black text-sky-600">8+</span>
                  <p className="text-xs font-bold text-slate-850 mt-1">Especialidades</p>
                  <p className="text-[10px] text-slate-500">Bajo un mismo techo en SJL</p>
                </div>
              </div>

              {/* Client CTA Quote card */}
              <div className="p-4 bg-gradient-to-tr from-[#0c2454] to-slate-850 text-white rounded-2xl relative overflow-hidden shadow">
                <p className="text-xs italic text-slate-250 leading-relaxed">
                  "El trato del personal con los niños es extraordinario. Mis hijos ya no sufren antes de ir a consulta. Excelente sede en Canto Grande!"
                </p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  <div className="w-6 h-6 bg-sky-450 text-[#0c2454] rounded-full flex items-center justify-center font-bold text-[10px]">
                    FB
                  </div>
                  <span className="text-[10px] font-bold">Familia Beltrán, Vecinos de Canto Grande</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. NUESTROS MEDICOS - EQUIPO SECION */}
      <section id="equipo" className="py-16 md:py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-sky-600 uppercase mb-2">Prestigio Médico Profesional</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 font-display">Nuestro Distinguido Staff Médico</h3>
            <p className="text-sm text-slate-600 mt-3">
              Conoce a los especialistas de Multident Canto Grande. Profesionales colegiados dedicados a devolverte la estética y funcionalidad de manera indolora.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Dr 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group">
              <div className="h-64 bg-slate-100 relative overflow-hidden flex items-end justify-center">
                <img 
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                  src={drMarco} 
                  alt="Dr. Marco Aurelio Valdivia" 
                />
                <div className="absolute top-3 right-3 bg-sky-600 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  Director Médico
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-display">Dr. Marco Aurelio Valdivia</h4>
                  <p className="text-xs font-semibold text-sky-600 font-mono">C.O.P. 18241 — R.N.E. 841</p>
                </div>
                <p className="text-xs text-slate-500">
                  Especialista en Rehabilitación Oral e Implantes Dentales de alta complejidad. Más de 15 años de trayectoria.
                </p>
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tratamiento Estelar</span>
                  <span className="font-bold text-slate-700">Implantes</span>
                </div>
              </div>
            </div>

            {/* Dr 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group">
              <div className="h-64 bg-slate-100 relative overflow-hidden flex items-end justify-center">
                <img 
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                  src={draAngela} 
                  alt="Dra. Angela Castro" 
                />
                <div className="absolute top-3 right-3 bg-[#0c2454] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  Especialista
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-display">Dra. Angela Castro</h4>
                  <p className="text-xs font-semibold text-sky-600 font-mono">C.O.P. 22105</p>
                </div>
                <p className="text-xs text-slate-500">
                  Odontopediatra dedicada al manejo de conducta infantil, sedación consciente y prevención temprana.
                </p>
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tratamiento Estelar</span>
                  <span className="font-bold text-slate-700">Niños</span>
                </div>
              </div>
            </div>

            {/* Dr 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group">
              <div className="h-64 bg-slate-100 relative overflow-hidden flex items-end justify-center">
                <img 
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                  src={drRoberto} 
                  alt="Dr. Roberto Ramirez" 
                />
                <div className="absolute top-3 right-3 bg-[#0c2454] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  Especialista
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-display">Dr. Roberto Ramírez</h4>
                  <p className="text-xs font-semibold text-sky-600 font-mono">C.O.P. 24890 — R.N.E. 1109</p>
                </div>
                <p className="text-xs text-slate-500">
                  Ortodoncista certificado en alineadores estéticos invisibles e interceptiva para adolescentes.
                </p>
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tratamiento Estelar</span>
                  <span className="font-bold text-slate-700">Ortodoncia</span>
                </div>
              </div>
            </div>

            {/* Dr 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group">
              <div className="h-64 bg-slate-100 relative overflow-hidden flex items-end justify-center">
                <img 
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" 
                  src={draJimena} 
                  alt="Dra. Jimena Rosales" 
                />
                <div className="absolute top-3 right-3 bg-[#0c2454] text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                  Especialista
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-display">Dra. Jimena Rosales</h4>
                  <p className="text-xs font-semibold text-sky-600 font-mono">C.O.P. 19561</p>
                </div>
                <p className="text-xs text-slate-500">
                  Magíster en Endodoncia Rotatoria y Microcirugía Apical. Especialista en control y alivio del dolor agudo.
                </p>
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tratamiento Estelar</span>
                  <span className="font-bold text-slate-700">Endodoncia</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. TESTIMONIOS SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1 font-mono">OPINIONES EN SAN JUAN DE LURIGANCHO</h2>
            <h3 className="text-3xl font-black text-slate-900 font-display">Testimonios de Pacientes Reales</h3>
            <div className="flex justify-center items-center gap-1.5 mt-2 bg-yellow-50 border border-yellow-100 py-1 px-3 rounded-full w-fit mx-auto text-xs text-slate-700 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Sede Recomendada por el 100% (14 opiniones registradas)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Llevé a mi hijo con la Dra. Angela para su profilaxis. El trato fue espectacular, tienen paciencia única con los más chiquitos. Súper recomendado en Canto Grande."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 mt-4">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  LV
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-950">Lucía Villanueva</h5>
                  <p className="text-[10px] text-slate-400">Madre de familia y vecina de SJL</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Me realicé una endodoncia con la Dra. Jimena y no sentí absolutamente nada de dolor. La tecnología rotatoria que usan es otro nivel comparado con consultorios tradicionales."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 mt-4">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  CH
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-950">Carlos Huamán</h5>
                  <p className="text-[10px] text-slate-400">Ingeniero, Paciente de Emergencia</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl relative shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "Excepcional atención para implantes. Toda la explicación del Dr. Marco Aurelio con tomografía 3D me dio la confianza que necesitaba. El presupuesto final fue muy transparente."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200/50 mt-4">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  EQ
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-950">Elena Quispe</h5>
                  <p className="text-[10px] text-slate-400">Docente de Lima Este</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. GALERIA AMBIENTES SECTION */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1 font-mono">INFRAESTRUCTURA DE PUNTA</h2>
            <h3 className="text-3xl font-black text-slate-900 font-display">Clínica, Ambientes y Equipamiento</h3>
            <p className="text-xs text-slate-500 mt-2">
              Conoce las cómodas instalaciones de nuestra sede en Canto Grande. Todo desinfectado bajo rigurosos estándares clínicos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="aspect-video relative rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
              <img className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" src={consultorio} alt="Consultorio Premium" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-[10px] font-bold">Consultorios Clínicos</span>
              </div>
            </div>

            <div className="aspect-video relative rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
              <img className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" src={sillaDiagnostico} alt="Silla de diagnostico" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-[10px] font-bold">Unidades Odontológicas Ergonomicas</span>
              </div>
            </div>

            <div className="aspect-video relative rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
              <img className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" src={esterilizacion} alt="Esterilizacion" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-[10px] font-bold">Zona de Autoclaves y Esterilización</span>
              </div>
            </div>

            <div className="aspect-video relative rounded-xl overflow-hidden border border-slate-200 shadow-xs group">
              <img className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" src={recepcion} alt="Recepcion" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-white text-[10px] font-bold">Recepcion Sede Pet Friendly</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. RESERVA DE CITAS FORM SECTION */}
      <section id="reservar-cita" className="py-16 md:py-24 bg-gradient-to-tr from-[#020e24] to-[#0d2a64] text-white scroll-mt-12 relative overflow-hidden">
        
        {/* Futuristic glowing cross on background representing dental aid */}
        <div className="absolute top-1/2 -right-16 -translate-y-1/2 opacity-[0.03] pointer-events-none">
          <PlusCircle className="w-96 h-96 stroke-[1px] stroke-white" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-[11px] font-mono uppercase bg-sky-500/20 text-sky-100 border border-sky-400/30 px-3 py-1 rounded-full tracking-wider">
                Módulo Online Integrado
              </span>
              <h2 className="text-3xl sm:text-4xl font-black font-display text-white mt-3">Reserva tu Cita de Evaluación</h2>
              <p className="text-xs text-slate-300 mt-2">
                Completa tus datos de contacto y el especialista de turno en la sede de Canto Grande reservará tu espacio de atención preferente.
              </p>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                <span>{formError}</span>
              </div>
            )}

            {/* Success screen code-generator representation */}
            {successLead ? (
              <div className="bg-gradient-to-tr from-sky-950 to-slate-950 border border-sky-400/30 p-6 sm:p-8 rounded-2xl text-center space-y-5 animate-fade-in">
                <div className="mx-auto w-14 h-14 bg-sky-500/20 border border-sky-400/50 rounded-full flex items-center justify-center text-sky-400 shrink-0">
                  <CheckCircle className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-sky-300 font-display">¡Cita Registrada Exitosamente!</h3>
                  <p className="text-xs text-slate-300">
                    Tu solicitud ha sido transmitida de manera directa al CRM de atención odontológica de Multident Canto Grande.
                  </p>
                </div>

                {/* Ticket code view */}
                <div className="p-5 bg-white/5 border border-white/5 rounded-xl max-w-sm mx-auto space-y-3 font-mono">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Código de Reserva:</span>
                    <span className="font-bold text-sky-450">{successLead.bookingCode}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Paciente:</span>
                    <span className="font-bold text-white max-w-[180px] truncate">{successLead.name}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Especialidad:</span>
                    <span className="font-bold text-white max-w-[180px] truncate">{successLead.specialty}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Fecha Estimada:</span>
                    <span className="font-bold text-white">{successLead.requestedDate} a las {successLead.requestedTime}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-2 max-w-md mx-auto">
                  <button
                    onClick={() => handleWhatsappSuccessConfirm(successLead)}
                    className="w-full py-3.5 bg-[#25d366] hover:bg-[#1ebe57] text-white rounded-full text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-[#25d366]" />
                    Confirmar por WhatsApp al Instante
                  </button>

                  <button
                    onClick={() => setSuccessLead(null)}
                    className="text-xs text-slate-400 hover:text-white underline transition-colors"
                  >
                    Registrar otra cita de familiar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Field Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Nombre Completo *</label>
                    <input 
                       type="text" 
                       required
                       placeholder="Ej. María Mendoza Quispe"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  {/* Field Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Teléfono de Contacto (WhatsApp) *</label>
                    <input 
                       type="tel" 
                       required
                       placeholder="Ej. 987654321"
                       value={formData.phone}
                       onChange={e => setFormData({...formData, phone: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  {/* Field Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Correo Electrónico (Opcional)</label>
                    <input 
                       type="email" 
                       placeholder="correo@ejemplo.com"
                       value={formData.email}
                       onChange={e => setFormData({...formData, email: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors placeholder:text-slate-500"
                    />
                  </div>

                  {/* Field Treatment */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Especialidad de Interés</label>
                    <div className="relative">
                      <select 
                         value={formData.specialty}
                         onChange={e => setFormData({...formData, specialty: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 appearance-none cursor-pointer"
                      >
                        {TREATMENTS.map(t => (
                          <option key={t.id} value={t.title} className="bg-slate-900 text-white">
                            {t.title}
                          </option>
                        ))}
                        <option value="Consulta Dental General" className="bg-slate-900 text-white">Consulta Dental General</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
                    </div>
                  </div>

                  {/* Field Preferred Date */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Fecha deseada</label>
                    <input 
                       type="date" 
                       required
                       min={new Date().toISOString().split('T')[0]}
                       value={formData.requestedDate}
                       onChange={e => setFormData({...formData, requestedDate: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  {/* Field Preferred Time */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Bloque horario preferido</label>
                    <div className="relative">
                      <select
                        value={formData.requestedTime}
                        onChange={e => setFormData({...formData, requestedTime: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 appearance-none cursor-pointer"
                      >
                        <option value="09:00" className="bg-slate-900 text-white">Mañana (09:00 AM - 12:00 PM)</option>
                        <option value="12:00" className="bg-slate-900 text-white">Mediodía (12:00 PM - 03:00 PM)</option>
                        <option value="15:00" className="bg-slate-900 text-white">Tarde (03:00 PM - 06:00 PM)</option>
                        <option value="18:00" className="bg-slate-900 text-white">Noche (06:00 PM - 08:00 PM)</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400" />
                    </div>
                  </div>

                </div>

                {/* Comments / Details */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-200 uppercase block">Descríbenos brevemente lo que necesitas (Sintomatología, objetivos)</label>
                  <textarea 
                    rows={3}
                    placeholder="Ej. Siento molestias con el frío en una muela posterior izquierda / Deseo ponerme brackets estéticos..."
                    value={formData.comments}
                    onChange={e => setFormData({...formData, comments: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-sky-400 focus:bg-white/10 transition-colors placeholder:text-slate-500"
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Procesando Solicitud...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Enviar Solicitud de Cita e Iniciar Registro
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 max-w-md mx-auto leading-relaxed">
                  *Al procesar tu reserva, aceptas el tratamiento de tus datos para agendar la cita médica según la Ley de Protección de Datos Personales N° 29733 de Perú.
                </p>

              </form>
            )}

          </div>
        </div>
      </section>

      {/* 8. PREGUNTAS FRECUENTES (FAQ) SECTION */}
      <section id="preguntas" className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1 font-mono">RESOLVIENDO TUS INQUIETUDES</h2>
            <h3 className="text-3xl font-black text-slate-900 font-display">Preguntas Frecuentes</h3>
            <p className="text-xs text-slate-500 mt-2">
              Despeja tus dudas clínicas, de tarifas y administrativas antes del contacto clínico.
            </p>
          </div>

          <div className="space-y-3.5" id="faqs-accordion">
            {faqs.map((f, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-slate-900"
                >
                  <span className="font-display pr-4">{f.q}</span>
                  <ChevronDown className={`w-5 h-5 text-sky-600 transition-transform p-0.5 shrink-0 duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed font-normal border-t border-slate-150 animate-fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 9. CONTACTO Y UBICACIÓN SECTION */}
      <section id="contacto" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Contact details */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase bg-[#0c2454]/10 text-[#0c2454] px-2.5 py-1 rounded">
                  DIRECCIÓN Y UBICACIÓN OFICIAL
                </span>
                <h2 className="text-3xl font-black text-slate-900 font-display">Comunícate con Nosotros</h2>
                <p className="text-xs text-slate-600">
                  Estamos ubicados en el corazón de Canto Grande, San Juan de Lurigancho. Te dejamos los accesos y horarios telefónicos de atención al paciente.
                </p>
              </div>

              {/* Physical details list */}
              <div className="space-y-4">
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-sky-600 shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Dirección Sede</h4>
                    <p className="text-xs text-slate-600">Av. Canto Grande 3636, San Juan de Lurigancho, Lima, 15401</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Frente al paradero de Canto Grande. Sede Pet Friendly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#25d366] shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5 fill-[#25d366] text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Central WhatsApp</h4>
                    <p className="text-xs text-slate-600 font-semibold font-mono hover:text-sky-600 cursor-pointer" onClick={handleWhatsappQuickClick}>
                      +51 908 874 468
                    </p>
                    <p className="text-[10px] text-slate-450 mt-0.5">Respuesta inmediata por especialistas de CRM de guardia.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-sky-600 shrink-0 shadow-sm">
                    <Phone className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Teléfono Auxiliar</h4>
                    <p className="text-xs text-slate-600 font-mono">908 874 468</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-sky-600 shrink-0 shadow-sm">
                    <Clock className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Horario de Atención</h4>
                    <p className="text-xs text-slate-600">Lunes a Sábado: 9:00 AM — 8:00 PM</p>
                    <p className="text-[10px] text-rose-500 font-semibold">Domingos y Feriados oficiales: Cerrado</p>
                  </div>
                </div>

              </div>

              {/* Social Channels badge */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">INSTAGRAM OFICIAL S.J.L.</span>
                  <a href="https://instagram.com/multidentcantogrande_sjl" target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-800 hover:text-sky-600 flex items-center gap-1 mt-0.5">
                    @multidentcantogrande_sjl
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-lg text-xs font-mono font-medium">
                  Pet Friendly 🐾
                </div>
              </div>

            </div>

            {/* Simulated Live Google Map (High-quality visually polished representation) */}
            <div className="lg:col-span-7" id="gmaps-preview">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-md space-y-3">
                <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-150 overflow-hidden flex flex-col items-center justify-center text-center">
                  
                  {/* Styled medical Map abstraction */}
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] -z-10"></div>
                  
                  {/* Concentric rings showing localization target */}
                  <div className="relative z-10 w-20 h-20 flex items-center justify-center">
                    <div className="absolute w-20 h-20 bg-sky-500/10 rounded-full animate-ping"></div>
                    <div className="absolute w-12 h-12 bg-sky-500/25 rounded-full animate-pulse"></div>
                    <div className="w-7 h-7 bg-gradient-to-tr from-[#0c2454] to-sky-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-md z-10">
                      M
                    </div>
                  </div>

                  <div className="z-10 space-y-1 mt-4 px-4">
                    <h4 className="text-sm font-bold text-slate-900 font-display">Clínica Multident Canto Grande</h4>
                    <p className="text-[11px] text-slate-500">Av. Canto Grande 3636, San Juan de Lurigancho (Altura Paradero Paradero Canto Grande)</p>
                  </div>

                  {/* Standard embedded layout styling */}
                  <div className="absolute bottom-3 left-3 bg-[#0c2454] text-white py-1 px-3 rounded-md text-[10px] font-mono flex items-center gap-1.5 shadow">
                    <span>GPS Sede: 12.0150° S, 77.0125° W</span>
                  </div>

                  {/* High visual quality mockup overlay */}
                  <a 
                    href="https://maps.google.com/?q=Av.+Canto+Grande+3636,+San+Juan+de+Lurigancho"
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute top-3 right-3 bg-white hover:bg-slate-50 text-slate-850 p-2 rounded-lg border border-slate-200 text-[10px] font-bold flex items-center gap-1 shadow-sm"
                  >
                    Abrir en Google Maps
                    <ExternalLink className="w-3 h-3 text-sky-600" />
                  </a>

                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 px-2.5">
                  <span>¿Vienes en tren?</span>
                  <span>Bajar en Estación San Carlos o Talleres, caminar 3 cuadras.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-10 pb-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={clinicLogo} 
                alt="Multident Canto Grande Logo" 
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-inner"
                referrerPolicy="no-referrer"
              />
              <span className="font-display font-bold text-lg text-white">MULTIDENT SJL</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Sede autorizada y certificada Multident en Canto Grande. Garantía de excelente salud oral en el distrito de San Juan de Lurigancho.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3">CONFIANZA CLÍNICA</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Médicos colegiados COP</li>
              <li>• Registro nacional de especialidad (RNE)</li>
              <li>• Equipamiento 100% digitalizado</li>
              <li>• Atención amigable con mascotas</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3">ESPECIALIDADES</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#tratamientos" className="hover:text-sky-400 transition-colors">Ortodoncia Estética e Invisible</a></li>
              <li><a href="#tratamientos" className="hover:text-sky-400 transition-colors">Implantes Dentales</a></li>
              <li><a href="#tratamientos" className="hover:text-sky-400 transition-colors">Odontopediatría Integral</a></li>
              <li><a href="#tratamientos" className="hover:text-sky-400 transition-colors">Endodoncia sin Dolor</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3">ENLACES DE INTERÉS</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-sky-400 transition-colors cursor-pointer" onClick={onAdminClick}>Panel de Control CRM Administrativo</span></li>
              <li><a href="#preguntas" className="hover:text-sky-400 transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#reservar-cita" className="hover:text-sky-450 transition-colors">Formulario de Citas</a></li>
              <li><span className="hover:text-sky-400 transition-colors cursor-pointer" onClick={handleWhatsappQuickClick}>Urgencias Consultorio</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Multident Canto Grande S.J.L. Todos los derechos reservados. Consultorio Clínico con licencia de funcionamiento oficial.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-350 cursor-pointer">Políticas de Privacidad</span>
            <span>•</span>
            <span className="hover:text-slate-350 cursor-pointer">Términos del Servicio</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
