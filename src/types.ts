/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CRMStatus = 
  | 'Nuevo' 
  | 'Contactado' 
  | 'En seguimiento' 
  | 'Cita agendada' 
  | 'Paciente registrado' 
  | 'Cerrado';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialty: string;
  requestedDate: string;
  requestedTime: string;
  comments: string;
  status: CRMStatus;
  createdAt: string;
  actionComments?: string;
  bookingCode: string;
  source: 'web_form' | 'whatsapp_click';
}

export interface ActivityLog {
  id: string;
  leadId: string;
  leadName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface QuickNotification {
  id: string;
  type: 'new_lead' | 'status_change' | 'appointment_booked';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  leadId?: string;
}

export interface TreatmentDetail {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  duration: string;
  technology: string;
  iconName: string;
  estimatedCostRange: string;
}
