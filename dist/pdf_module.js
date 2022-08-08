import '/lib/PDFjs.js'
const showPdf = function (url = './test.pdf'){

    // If absolute URL from the remote server is provided, configure the CORS
    // header on that server.
    var url = url;

    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/PDF.worker.js';

    var pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        scale = 0.8,
        canvas = document.getElementById('the-canvas'),
        ctx = canvas.getContext('2d');

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num, zoom=null) {
    pageRendering = true;
    // Using promise to fetch the page

    pdfDoc.getPage(num).then(function(page) {
        
        if(zoom){
            scale = zoom
        }

        var viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
        canvasContext: ctx,
        viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
        }
        });
    });

    // Update page counters
    document.getElementById('page_num').textContent = num;
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
    }

    /**
     * Displays previous page.
     */
    function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
    }


    /**
     * Displays next page.
     */
    function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
    }


    /* zom function */
    function zoomPlus (){
        const zoom = scale + Math.ceil(scale * 2.5) / 10

        renderPage(pageNum, zoom)
        // canvas.height = 100;
        // canvas.width = 500;
    }

    function zoomMoin(){

        const zoom = scale - Math.ceil(scale * 2.5) / 10

        renderPage(pageNum, zoom)

    }

    function resizeField(){

        const zoom = 1

        renderPage(pageNum, zoom)

    }

    function runAllEvent(){

        document.getElementById('zoomPlus').addEventListener('click', zoomPlus);

        document.getElementById('zoomMoin').addEventListener('click', zoomMoin);

        document.getElementById('resizeField').addEventListener('click', resizeField);

        document.getElementById('next').addEventListener('click', onNextPage);

        document.getElementById('prev').addEventListener('click', onPrevPage);
    }

    runAllEvent()

    /**
     * Asynchronously downloads PDF.
     */
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
    });

}

export default showPdf

