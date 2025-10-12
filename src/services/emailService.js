// Servicio de notificaciones por email
// Nota: Este es un servicio básico. En producción usarías un servicio como SendGrid, Nodemailer, etc.

export class EmailService {
  constructor() {
    this.templates = {
      welcome: {
        subject: "¡Bienvenido a Galletas App!",
        template: (user) => `
          <h1>¡Hola ${user.name}!</h1>
          <p>Gracias por registrarte en nuestra tienda de galletas.</p>
          <p>¡Esperamos que disfrutes de nuestros deliciosos productos!</p>
        `
      },
      orderConfirmation: {
        subject: "Confirmación de Pedido - Galletas App",
        template: (order, user) => `
          <h1>¡Pedido Confirmado!</h1>
          <p>Hola ${user.name},</p>
          <p>Tu pedido #${order.id} ha sido confirmado.</p>
          <p>Total: $${order.total}</p>
          <p>Estado: ${order.status}</p>
        `
      },
      orderStatusUpdate: {
        subject: "Actualización de Pedido - Galletas App",
        template: (order, user) => `
          <h1>Actualización de Pedido</h1>
          <p>Hola ${user.name},</p>
          <p>Tu pedido #${order.id} ha sido actualizado.</p>
          <p>Nuevo estado: ${order.status}</p>
        `
      },
      orderShipped: {
        subject: "¡Tu pedido ha sido enviado! - Galletas App",
        template: (order, user) => `
          <h1>¡Tu pedido está en camino!</h1>
          <p>Hola ${user.name},</p>
          <p>Tu pedido #${order.id} ha sido enviado.</p>
          <p>¡Pronto recibirás tus deliciosas galletas!</p>
        `
      }
    };
  }

  // Simular envío de email (en producción usarías un servicio real)
  async sendEmail(to, subject, html) {
    console.log(`📧 Email enviado a: ${to}`);
    console.log(`📧 Asunto: ${subject}`);
    console.log(`📧 Contenido: ${html}`);
    
    // En producción, aquí harías la llamada real al servicio de email
    // return await this.emailProvider.send({ to, subject, html });
    
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  // Enviar email de bienvenida
  async sendWelcomeEmail(user) {
    const template = this.templates.welcome;
    const html = template.template(user);
    
    return await this.sendEmail(user.email, template.subject, html);
  }

  // Enviar confirmación de pedido
  async sendOrderConfirmation(order, user) {
    const template = this.templates.orderConfirmation;
    const html = template.template(order, user);
    
    return await this.sendEmail(user.email, template.subject, html);
  }

  // Enviar actualización de estado de pedido
  async sendOrderStatusUpdate(order, user) {
    const template = this.templates.orderStatusUpdate;
    const html = template.template(order, user);
    
    return await this.sendEmail(user.email, template.subject, html);
  }

  // Enviar notificación de envío
  async sendOrderShipped(order, user) {
    const template = this.templates.orderShipped;
    const html = template.template(order, user);
    
    return await this.sendEmail(user.email, template.subject, html);
  }

  // Enviar email personalizado
  async sendCustomEmail(to, subject, html) {
    return await this.sendEmail(to, subject, html);
  }
}

// Instancia singleton del servicio
export const emailService = new EmailService();

