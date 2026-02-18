import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from "docx";
import fs from "fs";

function title(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text, bold: true, size: 48, font: "Calibri", color: "2E7D32" }),
    ],
  });
}

function subtitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
    children: [
      new TextRun({ text, size: 24, font: "Calibri", color: "666666", italics: true }),
    ],
  });
}

function heading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [
      new TextRun({ text, bold: true, size: 32, font: "Calibri", color: "2E7D32" }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({ text, bold: true, size: 26, font: "Calibri", color: "444444" }),
    ],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, bold: true, size: 22, font: "Calibri", color: "555555" }),
    ],
  });
}

function para(text) {
  return new Paragraph({
    spacing: { after: 150 },
    children: [new TextRun({ text, size: 22, font: "Calibri" })],
  });
}

function bullet(text, bold_prefix = "") {
  const children = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix, bold: true, size: 22, font: "Calibri" }));
  }
  children.push(new TextRun({ text, size: 22, font: "Calibri" }));
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children,
  });
}

function bullet2(text, bold_prefix = "") {
  const children = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix, bold: true, size: 22, font: "Calibri" }));
  }
  children.push(new TextRun({ text, size: 22, font: "Calibri" }));
  return new Paragraph({
    bullet: { level: 1 },
    spacing: { after: 60 },
    children,
  });
}

function flowStep(number, text) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: `${number}. `, bold: true, size: 22, font: "Calibri", color: "2E7D32" }),
      new TextRun({ text, size: 22, font: "Calibri" }),
    ],
  });
}

function separator() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    },
    children: [],
  });
}

function makeTableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(
      (text) =>
        new TableCell({
          shading: isHeader
            ? { type: ShadingType.SOLID, color: "2E7D32" }
            : undefined,
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  bold: isHeader,
                  size: 20,
                  font: "Calibri",
                  color: isHeader ? "FFFFFF" : "333333",
                }),
              ],
            }),
          ],
          width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
        })
    ),
  });
}

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 },
        },
      },
      children: [
        // ==========================================
        // PORTADA
        // ==========================================
        new Paragraph({ spacing: { after: 800 }, children: [] }),
        title("KAHU"),
        subtitle("Plataforma de Adopcion de Mascotas"),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: "Documento de Estructura y Flujos de Usuario",
              size: 28,
              font: "Calibri",
              color: "333333",
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [
            new TextRun({
              text: "MVP - Mexico 2026",
              size: 22,
              font: "Calibri",
              color: "888888",
            }),
          ],
        }),
        separator(),

        // ==========================================
        // 1. VISION GENERAL
        // ==========================================
        heading("1. Vision General"),
        para(
          "Kahu es una plataforma web que conecta rescatistas de mascotas con personas interesadas en adoptar perros y gatos en Mexico. La plataforma permite a rescatistas publicar perfiles de mascotas en adopcion, y a adoptantes buscar, filtrar y solicitar la adopcion de manera sencilla."
        ),
        para(
          "Cuando un rescatista acepta una solicitud de adopcion, se abre automaticamente un chat en tiempo real entre ambas partes para coordinar los detalles de la entrega de la mascota."
        ),

        // ==========================================
        // 2. ROLES DE USUARIO
        // ==========================================
        heading("2. Roles de Usuario"),

        heading2("2.1 Visitante (sin cuenta)"),
        bullet("Puede ver la pagina principal (landing page)"),
        bullet("Puede explorar el catalogo completo de mascotas disponibles"),
        bullet("Puede ver el detalle de cada mascota"),
        bullet("NO puede solicitar adopciones (se le pide registrarse)"),

        heading2("2.2 Adoptante"),
        bullet("Todo lo que puede hacer un visitante"),
        bullet("Puede enviar solicitudes de adopcion con un mensaje personalizado"),
        bullet("Puede ver el estado de sus solicitudes (pendiente, aceptada, rechazada)"),
        bullet("Puede chatear con rescatistas cuando su solicitud es aceptada"),

        heading2("2.3 Rescatista"),
        bullet("Puede publicar mascotas en adopcion con fotos, descripcion y datos"),
        bullet("Puede editar y eliminar sus publicaciones"),
        bullet("Puede cambiar el estado de sus mascotas (disponible, en proceso, adoptado)"),
        bullet("Recibe solicitudes de adopcion y puede aceptarlas o rechazarlas"),
        bullet("Puede chatear con adoptantes cuyas solicitudes fueron aceptadas"),

        // ==========================================
        // 3. MAPA DE PAGINAS
        // ==========================================
        heading("3. Mapa de Paginas"),

        new Table({
          rows: [
            makeTableRow(["Ruta", "Pagina", "Acceso", "Descripcion"], true),
            makeTableRow(["/", "Home", "Publico", "Landing page con hero, como funciona y CTA"]),
            makeTableRow(["/mascotas", "Catalogo", "Publico", "Grid de mascotas con filtros por especie, tamano y ciudad"]),
            makeTableRow(["/mascotas/[id]", "Detalle", "Publico", "Perfil completo de la mascota con boton de solicitud"]),
            makeTableRow(["/registro", "Registro", "Publico", "Formulario de registro con seleccion de rol"]),
            makeTableRow(["/login", "Login", "Publico", "Inicio de sesion"]),
            makeTableRow(["/dashboard", "Panel", "Autenticado", "Menu principal del usuario segun su rol"]),
            makeTableRow(["/dashboard/mascotas", "Mis mascotas", "Rescatista", "Lista de mascotas publicadas por el rescatista"]),
            makeTableRow(["/dashboard/mascotas/nueva", "Nueva mascota", "Rescatista", "Formulario para publicar mascota con fotos"]),
            makeTableRow(["/dashboard/mascotas/[id]", "Editar mascota", "Rescatista", "Editar datos o eliminar mascota"]),
            makeTableRow(["/dashboard/solicitudes", "Solicitudes", "Autenticado", "Rescatista: ve y gestiona solicitudes. Adoptante: ve estado"]),
            makeTableRow(["/dashboard/chat", "Mensajes", "Autenticado", "Lista de conversaciones activas"]),
            makeTableRow(["/dashboard/chat/[id]", "Chat", "Autenticado", "Chat en tiempo real entre rescatista y adoptante"]),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),

        // ==========================================
        // 4. ESTRUCTURA DE CADA PAGINA
        // ==========================================
        heading("4. Estructura Detallada de Cada Pagina"),

        heading2("4.1 Home (/)"),
        para("La pagina de inicio es la primera impresion de Kahu. Esta disenada para comunicar rapidamente el proposito de la plataforma."),
        heading3("Secciones:"),
        bullet("Hero principal: ", "Hero: "),
        bullet2("Icono de Kahu (huella de mascota)"),
        bullet2('Titulo: "Encuentra a tu nuevo mejor amigo"'),
        bullet2("Subtitulo explicativo sobre conectar rescatistas y adoptantes"),
        bullet2('Boton "Ver mascotas en adopcion" (va al catalogo)'),
        bullet2('Boton "Soy rescatista" (va al registro)'),
        bullet("Como funciona: ", "Seccion educativa: "),
        bullet2("Paso 1: Busca una mascota"),
        bullet2("Paso 2: Solicita la adopcion"),
        bullet2("Paso 3: Coordina la entrega"),
        bullet("Llamada a la accion para rescatistas", "CTA Rescatistas: "),
        bullet("Footer con nombre y mision de Kahu", "Footer: "),

        heading2("4.2 Catalogo de Mascotas (/mascotas)"),
        para("Pagina central donde los usuarios exploran las mascotas disponibles."),
        heading3("Elementos:"),
        bullet("Titulo y descripcion de la pagina"),
        bullet("Barra de filtros:", "Filtros: "),
        bullet2("Especie: Todas / Perros / Gatos"),
        bullet2("Tamano: Todos / Pequeno / Mediano / Grande"),
        bullet2("Busqueda por ciudad (campo de texto)"),
        bullet2("Boton para limpiar filtros"),
        bullet("Grid de tarjetas de mascotas (responsive: 1, 2 o 3 columnas):", "Resultados: "),
        bullet2("Foto de la mascota"),
        bullet2("Nombre y etiqueta de especie"),
        bullet2("Edad, sexo y tamano"),
        bullet2("Ciudad"),
        bullet("Mensaje cuando no hay resultados con los filtros actuales", "Estado vacio: "),

        heading2("4.3 Detalle de Mascota (/mascotas/[id])"),
        para("Perfil completo de una mascota individual."),
        heading3("Elementos:"),
        bullet("Boton para volver atras"),
        bullet("Layout de 2 columnas (foto grande + informacion):", "Contenido: "),
        bullet2("Foto principal de la mascota"),
        bullet2("Nombre con etiqueta de especie"),
        bullet2("Datos: edad, sexo, tamano, ciudad, raza"),
        bullet2("Descripcion completa"),
        bullet2("Nombre del rescatista que publico"),
        bullet("Segun el estado del usuario:", "Accion de adopcion: "),
        bullet2("Visitante sin cuenta: boton de registrarse"),
        bullet2("Adoptante: boton que abre formulario de solicitud"),
        bullet2("Ya envio solicitud: mensaje de confirmacion"),
        bullet2("Rescatista: mensaje de que no puede solicitar"),

        heading2("4.4 Registro (/registro)"),
        para("Formulario para crear una cuenta nueva."),
        heading3("Campos:"),
        bullet("Selector de rol (Adoptante / Rescatista) con descripcion de cada uno"),
        bullet("Nombre completo"),
        bullet("Correo electronico"),
        bullet("Contrasena (minimo 6 caracteres)"),
        bullet("Ciudad"),
        bullet("Telefono (opcional)"),
        bullet("Link a la pagina de login para quienes ya tienen cuenta"),

        heading2("4.5 Login (/login)"),
        para("Formulario sencillo de inicio de sesion."),
        heading3("Campos:"),
        bullet("Correo electronico"),
        bullet("Contrasena"),
        bullet("Link a la pagina de registro para quienes no tienen cuenta"),

        heading2("4.6 Dashboard (/dashboard)"),
        para("Panel principal del usuario autenticado. Muestra opciones diferentes segun el rol."),
        heading3("Elementos comunes:"),
        bullet("Saludo con nombre del usuario"),
        bullet("Rol y ciudad del usuario"),
        bullet("Boton de cerrar sesion"),
        heading3("Tarjetas de navegacion:"),
        bullet("Rescatista ve: Mis mascotas, Publicar mascota, Solicitudes, Mensajes"),
        bullet("Adoptante ve: Solicitudes, Mensajes"),

        heading2("4.7 Mis Mascotas (/dashboard/mascotas) - Solo Rescatista"),
        para("Lista de todas las mascotas publicadas por el rescatista."),
        heading3("Elementos:"),
        bullet("Boton para publicar nueva mascota"),
        bullet("Lista con foto miniatura, nombre, estado (disponible/en proceso/adoptado) y ciudad"),
        bullet("Click en cualquier mascota lleva a la pagina de edicion"),
        bullet("Estado vacio con invitacion a publicar primera mascota"),

        heading2("4.8 Nueva Mascota (/dashboard/mascotas/nueva) - Solo Rescatista"),
        para("Formulario completo para dar de alta una mascota en adopcion."),
        heading3("Campos:"),
        bullet("Nombre de la mascota"),
        bullet("Especie (Perro / Gato)"),
        bullet("Edad en meses"),
        bullet("Sexo (Macho / Hembra)"),
        bullet("Tamano (Pequeno / Mediano / Grande)"),
        bullet("Raza (opcional)"),
        bullet("Ciudad"),
        bullet("Descripcion (personalidad, vacunas, esterilizacion, etc.)"),
        bullet("Fotos (hasta 4 imagenes con vista previa y opcion de eliminar)"),

        heading2("4.9 Editar Mascota (/dashboard/mascotas/[id]) - Solo Rescatista"),
        para("Permite modificar los datos de una mascota existente."),
        heading3("Funcionalidades:"),
        bullet("Todos los campos editables de la mascota"),
        bullet("Cambiar estado: Disponible, En proceso, Adoptado"),
        bullet("Boton para eliminar la mascota (con confirmacion)"),

        heading2("4.10 Solicitudes (/dashboard/solicitudes)"),
        para("Vista diferente segun el rol del usuario."),
        heading3("Vista Rescatista:"),
        bullet("Lista de solicitudes recibidas para sus mascotas"),
        bullet("Cada solicitud muestra: foto y nombre de la mascota, nombre del solicitante, ciudad, mensaje"),
        bullet("Botones de Aceptar y Rechazar para solicitudes pendientes"),
        bullet("Al aceptar: se crea automaticamente una conversacion de chat"),
        heading3("Vista Adoptante:"),
        bullet("Lista de solicitudes enviadas"),
        bullet("Cada solicitud muestra: foto y nombre de la mascota, mensaje enviado, estado"),

        heading2("4.11 Lista de Mensajes (/dashboard/chat)"),
        para("Lista de todas las conversaciones activas del usuario."),
        heading3("Cada conversacion muestra:"),
        bullet("Foto de la mascota"),
        bullet("Nombre de la otra persona"),
        bullet("Nombre de la mascota"),
        bullet("Ultimo mensaje enviado (truncado)"),

        heading2("4.12 Chat (/dashboard/chat/[id])"),
        para("Chat en tiempo real entre rescatista y adoptante."),
        heading3("Elementos:"),
        bullet("Encabezado con nombre de la persona y mascota"),
        bullet("Boton para volver a la lista de mensajes"),
        bullet("Area de mensajes con scroll (mensajes propios a la derecha, del otro a la izquierda)"),
        bullet("Cada mensaje muestra contenido y hora"),
        bullet("Campo de texto para escribir y boton de enviar"),
        bullet("Los mensajes se actualizan en tiempo real (sin necesidad de recargar)"),

        // ==========================================
        // 5. FLUJOS DE USUARIO
        // ==========================================
        heading("5. Flujos de Experiencia de Usuario"),

        heading2("5.1 Flujo del Visitante"),
        para("Un usuario que llega por primera vez a Kahu:"),
        flowStep(1, "Llega a la pagina de inicio (Home) y ve el proposito de Kahu"),
        flowStep(2, 'Hace click en "Ver mascotas en adopcion"'),
        flowStep(3, "Explora el catalogo, filtra por especie, tamano o ciudad"),
        flowStep(4, "Hace click en una mascota que le interesa y ve su perfil completo"),
        flowStep(5, 'Ve el boton "Registrate para adoptar" ya que no tiene cuenta'),
        flowStep(6, "Decide registrarse como adoptante o rescatista"),

        separator(),

        heading2("5.2 Flujo del Adoptante"),
        para("Una persona que quiere adoptar una mascota:"),

        heading3("Registro:"),
        flowStep(1, 'Entra a /registro y selecciona el rol "Adoptante"'),
        flowStep(2, "Llena sus datos: nombre, email, contrasena, ciudad"),
        flowStep(3, "Se crea su cuenta y es redirigido al Dashboard"),

        heading3("Busqueda y solicitud:"),
        flowStep(4, "Desde el Dashboard o el catalogo, navega las mascotas disponibles"),
        flowStep(5, "Encuentra una mascota que le gusta y entra a su perfil"),
        flowStep(6, 'Hace click en "Solicitar adopcion"'),
        flowStep(7, "Se abre un formulario donde escribe por que quiere adoptar (su situacion, experiencia, hogar)"),
        flowStep(8, "Envia la solicitud"),

        heading3("Seguimiento:"),
        flowStep(9, "En /dashboard/solicitudes ve su solicitud con estado 'Pendiente'"),
        flowStep(10, "Cuando el rescatista responde, el estado cambia a 'Aceptada' o 'Rechazada'"),

        heading3("Coordinacion (si es aceptada):"),
        flowStep(11, "Aparece una nueva conversacion en /dashboard/chat"),
        flowStep(12, "Entra al chat y coordina con el rescatista los detalles: punto de encuentro, dia, hora, requisitos"),
        flowStep(13, "Se realiza la entrega de la mascota de manera presencial"),

        separator(),

        heading2("5.3 Flujo del Rescatista"),
        para("Una persona u organizacion que rescata mascotas y busca hogares:"),

        heading3("Registro:"),
        flowStep(1, 'Entra a /registro y selecciona el rol "Rescatista"'),
        flowStep(2, "Llena sus datos: nombre, email, contrasena, ciudad"),
        flowStep(3, "Se crea su cuenta y es redirigido al Dashboard"),

        heading3("Publicar mascota:"),
        flowStep(4, 'En el Dashboard, hace click en "Publicar mascota"'),
        flowStep(5, "Llena el formulario: nombre, especie, edad, sexo, tamano, raza, ciudad, descripcion"),
        flowStep(6, "Sube hasta 4 fotos de la mascota"),
        flowStep(7, 'Publica y la mascota aparece inmediatamente en el catalogo como "Disponible"'),

        heading3("Gestion de solicitudes:"),
        flowStep(8, "Cuando un adoptante envia una solicitud, aparece en /dashboard/solicitudes"),
        flowStep(9, "Ve el mensaje del adoptante, su nombre y ciudad"),
        flowStep(10, "Decide aceptar o rechazar la solicitud"),

        heading3("Coordinacion (al aceptar):"),
        flowStep(11, 'El estado de la mascota cambia automaticamente a "En proceso"'),
        flowStep(12, "Se crea una conversacion de chat con el adoptante"),
        flowStep(13, "En el chat, coordina los detalles de la entrega"),
        flowStep(14, 'Una vez entregada, puede cambiar el estado de la mascota a "Adoptado"'),

        separator(),

        // ==========================================
        // 6. DISENO RESPONSIVE
        // ==========================================
        heading("6. Diseno Responsive"),
        para("Kahu esta disenado con enfoque mobile-first, considerando que la mayoria de usuarios en Mexico accederan desde su celular."),

        heading3("Adaptaciones movil:"),
        bullet("Navegacion: menu hamburguesa en lugar de links visibles"),
        bullet("Catalogo: 1 columna en movil, 2 en tablet, 3 en desktop"),
        bullet("Formularios: campos apilados verticalmente"),
        bullet("Chat: ocupa toda la pantalla para mejor experiencia"),
        bullet("Detalle de mascota: foto arriba, informacion abajo (en desktop van lado a lado)"),

        // ==========================================
        // 7. STACK TECNOLOGICO
        // ==========================================
        heading("7. Stack Tecnologico"),
        new Table({
          rows: [
            makeTableRow(["Componente", "Tecnologia", "Proposito"], true),
            makeTableRow(["Frontend", "Next.js 16 (React)", "Pagina web con SSR y SEO"]),
            makeTableRow(["Estilos", "Tailwind CSS + shadcn/ui", "Diseno visual profesional y responsive"]),
            makeTableRow(["Base de datos", "Supabase (PostgreSQL)", "Almacenamiento de datos"]),
            makeTableRow(["Autenticacion", "Supabase Auth", "Registro e inicio de sesion"]),
            makeTableRow(["Storage", "Supabase Storage", "Almacenamiento de fotos de mascotas"]),
            makeTableRow(["Chat en tiempo real", "Supabase Realtime", "Mensajes instantaneos"]),
            makeTableRow(["Hosting", "Vercel", "Despliegue y URL publica"]),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),

        new Paragraph({ spacing: { before: 600 }, children: [] }),
        separator(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: "Kahu - Conectando mascotas con hogares en Mexico",
              size: 20,
              font: "Calibri",
              color: "888888",
              italics: true,
            }),
          ],
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("../Kahu_Estructura_y_Flujos.docx", buffer);
console.log("Documento generado: Kahu_Estructura_y_Flujos.docx");
