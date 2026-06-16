/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TreatmentDetail } from '../types';

export const TREATMENTS: TreatmentDetail[] = [
  {
    id: 'ortodoncia',
    title: 'Ortodoncia Especializada',
    description: 'Alinea tus dientes y mejora tu mordida utilizando brackets metálicos, estéticos (cerámicos, zafiro) o alineadores invisibles de última generación.',
    benefits: [
      'Corrige dientes apiñados o separados.',
      'Mejora la función masticatoria e higiene.',
      'Aumenta la autoestima con una sonrisa alineada.',
      'Opciones altamente estéticas e imperceptibles.'
    ],
    duration: '12 a 24 meses',
    technology: 'Alineadores invisibles y brackets autoligados pasivos',
    iconName: 'Sparkles',
    estimatedCostRange: 'S/. 1,800 - S/. 4,500'
  },
  {
    id: 'implantes',
    title: 'Implantes Dentales',
    description: 'Recupera piezas dentales perdidas de forma permanente y natural mediante raíces de titanio biocompatible integradas al hueso con coronas de porcelana o zirconio.',
    benefits: [
      'Se siente y luce exactamente como un diente natural.',
      'Evita el desgaste de los dientes vecinos.',
      'Previene la pérdida ósea del maxilar.',
      'Permite volver a comer con total seguridad y comodidad.'
    ],
    duration: '2 a 4 meses de oseointegración',
    technology: 'Planificación 3D y guiado quirúrgico computarizado',
    iconName: 'PlusCircle',
    estimatedCostRange: 'S/. 1,500 - S/. 3,200 por pieza'
  },
  {
    id: 'endodoncia',
    title: 'Endodoncia Avanzada',
    description: 'Elimina el dolor severo y salva tus dientes naturales de la extracción tratando el nervio dental dañado por caries profundas o traumatismos.',
    benefits: [
      'Elimina por completo la infección y el dolor dental.',
      'Conserva tu diente natural en boca.',
      'Tratamiento rápido y sin dolor bajo anestesia localizada.',
      'Evita tratamientos de prótesis más complejos en el futuro.'
    ],
    duration: '1 a 2 sesiones',
    technology: 'Sistemas rotatorios y localizador de ápice digital',
    iconName: 'Activity',
    estimatedCostRange: 'S/. 350 - S/. 700'
  },
  {
    id: 'rehabilitacion',
    title: 'Rehabilitación Oral',
    description: 'Restaura la función masticatoria, estética y anatomía dental mediante coronas, puentes fijos, incrustaciones o prótesis removibles de alta durabilidad.',
    benefits: [
      'Devuelve la capacidad de masticar correctamente todo tipo de alimentos.',
      'Restaura piezas rotas o severamente desgastadas.',
      'Materiales altamente estéticos (Zirconio, Disilicato de Litio).',
      'Unión biomecánica fuerte y duradera.'
    ],
    duration: '2 a 3 citas',
    technology: 'Materiales CAD/CAM e impresiones digitales',
    iconName: 'Grid',
    estimatedCostRange: 'S/. 500 - S/. 1,800'
  },
  {
    id: 'odontopediatria',
    title: 'Odontopediatría Integral',
    description: 'Cuidado dental preventivo, educativo y especializado para niños en un ambiente lúdico, empático, sin miedo y diseñado especialmente para ellos.',
    benefits: [
      'Previene caries y problemas de mordida desde temprana edad.',
      'Ambiente libre de estrés que evita el trauma al dentista.',
      'Tratamiento de fluorización, sellantes y profilaxis amigable.',
      'Educación interactiva en técnicas de cepillado del niño.'
    ],
    duration: '30 a 45 minutos por sesión',
    technology: 'Técnicas de manejo de conducta y sedación consciente con óxido nitroso',
    iconName: 'Heart',
    estimatedCostRange: 'S/. 80 - S/. 150'
  },
  {
    id: 'blanqueamiento',
    title: 'Blanqueamiento Dental LED',
    description: 'Aclara el tono de tus dientes hasta 4 tonos en una sola sesión utilizando geles blanqueadores de alta concentración activados por luz LED fría.',
    benefits: [
      'Resultados visibles de forma inmediata en solo 45 minutos.',
      'Elimina manchas causadas por café, té, alimentos o tabaco.',
      'Tratamiento seguro para el esmalte dental bajo supervisión médica.',
      'Incluye kit de mantenimiento para mayor duración de resultados.'
    ],
    duration: '1 sesión de 60 minutos',
    technology: 'Luz LED de activación fría fotosensible',
    iconName: 'Sun',
    estimatedCostRange: 'S/. 250 - S/. 500'
  },
  {
    id: 'estetica',
    title: 'Estética Dental y Carillas',
    description: 'Consigue tu sonrisa ideal mediante Diseño de Sonrisa Digital, carillas de resina de alta estética o carillas de porcelana ultra finas.',
    benefits: [
      'Corrige forma, tamaño, color y pequeñas desalineaciones dentales.',
      'Tratamiento mínimamente invasivo con nula o mínima preparación del esmalte.',
      'Cambio estético radical y natural de alta satisfacción.',
      'Planificación digital previa para previsualizar los resultados.'
    ],
    duration: '2 a 3 citas',
    technology: 'Diseño de Sonrisa Digital (DSD) e impresoras 3D',
    iconName: 'Shield',
    estimatedCostRange: 'S/. 800 - S/. 1,600 por carilla'
  },
  {
    id: 'cirugia',
    title: 'Cirugía Oral e Implantes',
    description: 'Extracciones complejas del tercer molar (muelas del juicio), biopsias, frenectomías y remodelación de encías de forma segura y sin dolor.',
    benefits: [
      'Alivia dolores crónicos, infecciones y apiñamiento de dientes.',
      'Procedimiento rápido con protocolos de bioseguridad del más alto nivel.',
      'Control postoperatorio personalizado y medicamentos controlados.',
      'Recuperación guiada y técnicas de sutura atraumática.'
    ],
    duration: '30 a 60 minutos',
    technology: 'Bisturí piezoeléctrico de alta precisión ultrasónico',
    iconName: 'Users',
    estimatedCostRange: 'S/. 300 - S/. 800'
  }
];
