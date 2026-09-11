/**
 * Servicio de Generación de PDF e Impresión Clínica de Alta Fidelidad
 */

/**
 * Imprime exclusivamente el documento clínico mediante un iframe aislado
 * garantizando calidad vectorial 100% nítida y eliminando cualquier elemento de la interfaz.
 */
export const printClinicalDocument = (elementId: string = 'clinical-interview-pdf-document'): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`No se encontró el elemento con ID "${elementId}" para imprimir.`);
    window.print();
    return;
  }

  // Crear iframe oculto
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position: fixed; top: -9999px; left: -9999px; width: 0; height: 0; border: none;');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    window.print();
    return;
  }

  // Recopilar estilos CSS del documento principal
  const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>Informe de Entrevista Inicial - Ukiana</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      ${styleTags}
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }
        html, body {
          background: #ffffff !important;
          color: #2D2832 !important;
          font-family: 'Manrope', system-ui, -apple-system, sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
        }
        #clinical-interview-pdf-document {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
          background: #ffffff !important;
          display: block !important;
          visibility: visible !important;
        }
      </style>
    </head>
    <body>
      ${element.outerHTML}
    </body>
    </html>
  `);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Fallo al invocar print en iframe, fallback a window.print()', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }
  }, 400);
};

/**
 * Descarga directamente el documento como archivo físico .pdf
 */
export const downloadClinicalPdf = async (
  elementId: string = 'clinical-interview-pdf-document',
  fileName: string = 'Informe_Entrevista_Inicial.pdf'
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento clínico no encontrado');
  }

  const [html2canvasModule, jsPDFModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ]);

  const html2canvas = (html2canvasModule.default || html2canvasModule) as any;
  const jsPDFClass = (jsPDFModule as any).jsPDF || (jsPDFModule as any).default || jsPDFModule;

  // Renderizar canvas a 2x de resolución
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    scrollX: 0,
    scrollY: 0
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDFClass({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = 210; // A4 mm
  const pdfHeight = 297; // A4 mm
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Página 1
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Páginas subsecuentes
  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
  }

  pdf.save(fileName);
};
