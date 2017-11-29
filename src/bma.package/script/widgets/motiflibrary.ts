(function ($) {
    $.widget("BMA.motiflibrary", {
        options: {
            motifs: [],
            container: undefined
        },

        _slickContainer: undefined,
        _isInitialized: false,
        _isOpened: false,

        _create: function () {
            var that = this;

            /*
            <div class="ml-open-container">
                <div class='ml-container' style="display:none;">
                    <div class='ml-single-item'>
                    </div>
                </div>
                <div class="ml-open">
                    <div class="ml-open-icon"></div>
                </div>
            </div>
            */

            //Creating layout
            var root = that.element;
            root.addClass("ml-open-container");

            //Motifs container
            var mlContainer = $("<div></div>").addClass("ml-container").appendTo(root);
            mlContainer.hide();

            var mlSingleItem = $("<div></div>").addClass("ml-single-item").appendTo(mlContainer);
            that._slickContainer = mlSingleItem;

            //Motif Library open button
            var mlOpen = $("<div></div>").addClass("ml-open").appendTo(root);
            var mlOpenIcon = $("<div></div>").addClass("ml-open-icon").appendTo(mlOpen);

            mlOpen.click((arg) => {
                if (that._isOpened)
                    mlContainer.hide();
                else {
                    mlContainer.show();
                    if (!that._isInitialized && that.options.motifs.length > 0) {
                        that._createCards();
                        that._isInitialized = true;
                    }
                }
                that._isOpened = !that._isOpened;
            });

        },

        _createCards: function () {
            var that = this;
            var mlmotifs = that.options.motifs;
            var slickContainer = that._slickContainer;

            //Clear previous container
            if (that.isInitialized) {
                slickContainer.unslick();
            }
            slickContainer.empty();

            for (var i = 0; i < mlmotifs.length; i++) {
                var slickCard = $("<div></div>").addClass("ml-element").appendTo(slickContainer);

                //Adding name
                var motifHeader = $("<div></div>").addClass("ml-card-title").text(mlmotifs[i].Name).appendTo(slickCard);

                //Adding preview
                var motifPreview = $("<div></div>").addClass("ml-bounding-box").appendTo(slickCard);
                var motifPreviewPicture = $("<div></div>").addClass("ml-preview").addClass("ml-draggable-element").attr("data-motifid", i).appendTo(motifPreview);
                // make it base64
                var svg64 = btoa(mlmotifs[i].Preview);
                var b64Start = 'data:image/svg+xml;base64,';
                // prepend a "header"
                var image64 = "url(" + b64Start + svg64 + ")";
                motifPreviewPicture.css("background-image", image64);

                //Adding description
                var motifHeader = $("<div></div>").addClass("ml-card-description").text(mlmotifs[i].Description).appendTo(slickCard);
            }


            var prev = '<div class="ml-navbutton ml-navbutton-prev"></div>';
            var next = '<div class="ml-navbutton ml-navbutton-next"></div>';
            slickContainer.slick({
                dots: true,
                infinite: true,
                centerMode: true,
                variableWidth: true,
                draggable: false,
                prevArrow: prev,
                nextArrow: next,
            });

            $('*[draggable!=true]', '.slick-track').unbind('dragstart');
            $(".ml-draggable-element").draggable({
                helper: "clone", appendTo: that.options.container, containment: that.options.container, cursor: "pointer", scope: "ml-card"
            });
        },

        _refresh: function () {
            var that = this;
            if (that.option.isOpened) {

                that.isInitialized = false;
            }
        },

        _setOption: function (key, value) {
            var that = this;
            
            this._super(key, value);

            switch (key) {
                case "motifs":
                    if (that._isInitialized) {
                        that._createCards();
                    }
                    break;
                case "container":
                    $(".ml-draggable-element").draggable({
                        helper: "clone", appendTo: that.options.container, containment: that.options.container, cursor: "pointer", scope: "ml-card"
                    });
                    break;
            }
        }

    });
} (jQuery));

interface JQuery {
    motiflibrary(): JQuery;
    motiflibrary(settings: any): JQuery;
    motiflibrary(optionLiteral: string, optionName: string): any;
    motiflibrary(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}