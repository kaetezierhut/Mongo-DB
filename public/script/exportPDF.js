const buttonExportPDF = document.getElementById("export-pdf")
buttonExportPDF.addEventListener("click", () => {
    const element = document.getElementById('page-flex')
    const opt = {
        margin: 1,
        filename: 'myfile.pdf',
        image: {
            type: 'jpeg',
            quality: 0.98
        },
        html2canvas: {
            scale: 2
        },
        jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: {
            mode: 'avoid-all',
            before: '#page2el'
        }
    };

    // New Promise-based usage:
    html2pdf().set(opt).from(element).save()
})
