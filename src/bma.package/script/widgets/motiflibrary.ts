(function ($) {
    $.widget("BMA.motiflibrary", {
        options: {
            motifs: [],
            container: undefined,
            changePreloadedVisibility: undefined,
            deleteMotif: undefined
        },

        _mlOpen: undefined,
        _mlContainer: undefined,

        _slickContainer: undefined,
        _isInitialized: false,
        _isOpened: false,
        _isAnimationShown: false,

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

            root.droppable({
                drop: function (event, ui) {
                    window.Commands.Execute("TryCreateMotifFromSelection", undefined);
                }
            });

            //Motifs container
            var mlContainer = $("<div></div>").addClass("ml-container").appendTo(root);
            that._mlContainer = mlContainer;
            var mlSingleItem = $("<div></div>").addClass("ml-single-item").appendTo(mlContainer);
            that._slickContainer = mlSingleItem;

            //Motif Library open button
            var mlOpen = $("<div></div>").addClass("ml-open").appendTo(root);
            that._mlOpen = mlOpen;
            var mlOpenIcon = $("<div></div>").addClass("ml-open-icon").appendTo(mlOpen);

            mlOpen.click((arg) => {
                if (that._isOpened) {
                    if (that._isAnimationShown) {
                        that._hideLoading(mlOpen);
                    } else {
                        mlContainer.animate({ height: "-=300px", "padding-top": "-=40px", "padding-bottom": "-=40px" });
                    }
                }
                else {
                    if (that.options.motifs.length > 0) {
                        mlContainer.animate({ height: "+=300px", "padding-top": "+=40px", "padding-bottom": "+=40px" });
                        if (!that._isInitialized) {
                            that._createCards();
                            that._isInitialized = true;
                        }
                    }
                    else {
                        that._showLoading(mlOpen);
                    }
                }
                that._isOpened = !that._isOpened;
            });

            $(window).resize((e) => {
                if (that._isInitialized) {
                    that._createCards();
                }
            });

        },

        _subscribeToClick: function (div, motif, i) {
            div.click((e) => {
                if (motif.IsPreloaded) {
                    if (this.options.changePreloadedVisibility !== undefined)
                        this.options.changePreloadedVisibility();
                } else {
                    if (this.options.deleteMotif !== undefined)
                        this.options.deleteMotif(i);
                }
            });
        },

        _subscribeToHover: function (div, divToShow) {
            divToShow.hide();
            div.hover((e) => { divToShow.show(); }, (e) => { divToShow.hide(); });
        },

        _setEditableHeader: function (div, card) {
            div.editable({
                autoselect: true, //select content automatically when editing starts
                save: function (content) {
                    card.Name = div.text();
                },
            });
            div.keydown((e) => { e.stopPropagation(); });
            div.keyup((e) => { e.stopPropagation(); });
            div.keypress((e) => { e.stopPropagation(); });
        },

        _setEditableDescription: function (div, card) {
            div.editable({
                autoselect: true, //select content automatically when editing starts
                save: function (content) {
                    card.Description = div.text();
                },
            });
            div.keydown((e) => { e.stopPropagation(); });
            div.keyup((e) => { e.stopPropagation(); });
            div.keypress((e) => { e.stopPropagation(); });
        },


        _createCards: function () {
            var that = this;
            var mlmotifs = that.options.motifs;
            var slickContainer = that._slickContainer;

            //Clear previous container
            if (that.isInitialized) {
                slickContainer.slick('unslick');
            }
            slickContainer.empty();

            for (var i = 0; i < mlmotifs.length; i++) {
                var slickCard = $("<div></div>").addClass("ml-element").appendTo(slickContainer);

                //Adding name
                var motifHeader = $("<div></div>").addClass("ml-card-title").text(mlmotifs[i].Name).appendTo(slickCard);
                if (!mlmotifs[i].IsPreloaded) {
                    this._setEditableHeader(motifHeader, mlmotifs[i]);
                }

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
                var motifDescription = $("<div></div>").addClass("ml-card-description").text(mlmotifs[i].Description).appendTo(slickCard);
                if (!mlmotifs[i].IsPreloaded) {
                    this._setEditableDescription(motifDescription, mlmotifs[i]);
                }

                //Adding delete button
                var motifDelete = $("<div></div>").addClass("ml-card-delete").appendTo(motifPreview);
                if (mlmotifs[i].IsPreloaded) {
                    motifDelete.addClass("ml-card-delete-iconhide");
                }
                else {
                    motifDelete.addClass("ml-card-delete-icontrash");
                }

                that._subscribeToClick(motifDelete, mlmotifs[i], i);
                that._subscribeToHover(motifPreview, motifDelete);
            }


            var prev = '<div class="ml-navbutton ml-navbutton-prev"></div>';
            var next = '<div class="ml-navbutton ml-navbutton-next"></div>';

            var slidesToShow = ($(window).width() / 370) | 0;

            //slickContainer.on("afterChange", (e, s, cs) => {
            //    if (cs === 0) {
            //        $(".ml_navbutton-prev").addClass("ml-prev-end");
            //    } else {
            //        $(".ml_navbutton-prev").removeClass("ml-prev-end");
            //    }
            //});

            slickContainer.slick({
                dots: true,
                infinite: false, 
                centerMode: false, 
                draggable: false,
                prevArrow: prev,
                nextArrow: next,
                slidesToShow: slidesToShow
            });


            

            $('*[draggable!=true]', '.slick-track').unbind('dragstart');
            $(".ml-draggable-element").draggable({
                helper: "clone", appendTo: that.options.container, containment: that.options.container, cursor: "pointer", scope: "ml-card"
            });

            if (that._isAnimationShown) {
                that._hideLoading(that._mlOpen);
                that._mlContainer.animate({ height: "+=300px", "padding-top": "+=40px", "padding-bottom": "+=40px" });
            }

            that.isInitialized = true;
        },

        _showLoading: function (clicked) {
            clicked.animate({ height: "+=30px" });
            var snipper = $('<div class="spinner loading"></div>').css("margin-top", 10).appendTo(clicked);
            for (var i = 1; i < 4; i++) {
                $('<div></div>').addClass('bounce' + i).appendTo(snipper);
            }
            this._isAnimationShown = true;
        },

        _hideLoading: function (toHide) {
            toHide.each(function () {
                var load = $(this).children().filter(".loading");
                if (load.length) {
                    load.detach();
                    $(this).animate({ height: "-=30px" });
                }
            });
            this._isAnimationShown = false;
        },

        _setOption: function (key, value) {
            var that = this;

            this._super(key, value);

            switch (key) {
                case "motifs":
                    that._isInitialized = false;
                    if (that._isOpened) {
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
}(jQuery));

interface JQuery {
    motiflibrary(): JQuery;
    motiflibrary(settings: any): JQuery;
    motiflibrary(optionLiteral: string, optionName: string): any;
    motiflibrary(optionLiteral: string, optionName: string, optionValue: any): JQuery;
}