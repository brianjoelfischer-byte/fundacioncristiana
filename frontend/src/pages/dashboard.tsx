import React from 'react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-gray-50 p-8"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          ¡Bienvenido, Juan! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Vacaciones', value: '15 días', icon: '🏖️' },
          { label: 'Solicitudes', value: '2 pendientes', icon: '📋' },
          { label: 'Recibos', value: 'Mayo 2024', icon: '📄' },
          { label: 'Cumpleaños', value: 'Próximo: 5 días', icon: '🎂' },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Payroll */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Últimos Recibos</h2>
          <div className="space-y-4">
            {[
              { month: 'Mayo 2024', status: '✅ Firmado' },
              { month: 'Abril 2024', status: '✅ Firmado' },
              { month: 'Marzo 2024', status: '✅ Firmado' },
            ].map((receipt, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">{receipt.month}</p>
                  <p className="text-sm text-gray-600">{receipt.status}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-semibold">
                  Descargar →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="space-y-3">
            {[
              { label: 'Solicitar Permiso', icon: '📅' },
              { label: 'Pedir Vacaciones', icon: '🏖️' },
              { label: 'Descargar Recibo', icon: '📥' },
              { label: 'Hablar con RRHH', icon: '💬' },
            ].map((action, i) => (
              <button
                key={i}
                className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition font-medium text-sm"
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Announcements */}
      <motion.div variants={item} className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">📢 Anuncios Importantes</h3>
        <ul className="space-y-2">
          <li>✓ Se actualizó la plataforma HR a versión Premium</li>
          <li>✓ Nuevo sistema de IA disponible 24/7</li>
          <li>✓ Capacitación obligatoria: Próxima semana</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
