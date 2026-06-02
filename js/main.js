var jPM = {};

$(function() {

    jPM = $.jPanelMenu({

        menu : '#menu',
        trigge : '.menu-trigger',
        animated: false,
        openPosition: "350px",
        beforeOpen : ( function() {

            if (matchMedia('only screen and (min-width: 992px)').matches) {
                $('.sidebar').css("left", "350px");
            }

        }),
        beforeClose : ( function() {

            $('.sidebar').css("left", "0");
            $('.writer-icon, .side-writer-icon').removeClass("fadeOutUp");
        })
    });

    jPM.on();

    $('.select-posts, .select-categories').on('click', function () {

        $('.home-page-posts').toggleClass("hide");
        $('.home-page-categories').toggleClass("hide");

        $('.select-posts').toggleClass("active");
        $('.select-categories').toggleClass("active");

        $('.home-footer').toggleClass("hide");
    });

    $('.writer-icon').on('click', function () {
        $(this).addClass("fadeOutUp");

    });

    var graphData = [{
        // Visits
        data: [ [11, 540], [12, 600], [13,645], [14, 672], [15, 591], [16, 789], [17, 794], [18, 732], [19, 600],[20, 520], [21, 500] ],
        color: '#69d193'
    }, {
        // Returning Visits
        data: [ [11, 500], [12, 523], [13, 530], [14, 423], [15, 543], [16, 624], [17, 732], [18, 580],[19, 580], [20, 430], [21, 450] ],
        color: '#4761e2',
        points: { radius: 4, fillColor: '#4761e2' }
    }
    ];

    if( $('#graph-lines').length > 0 ) {

        $.plot($('#graph-lines'), graphData, {
            series: {
                points: {
                    show: true,
                    radius: 5
                },
                lines: {
                    show: true
                },
                shadowSize: 0
            },
            grid: {
                color: '#646464',
                borderColor: 'transparent',
                borderWidth: 20,
                hoverable: true
            },
            xaxis: {
                tickColor: 'transparent',
                tickDecimals: 0
            },
            yaxis: {
                tickSize: 100,
                label: "Price (USD)"
            }
        });

        // Bars
        $.plot($('#graph-bars'), graphData, {
            series: {
                bars: {
                    show: true,
                    barWidth: 0.9,
                    align: 'center'
                },
                shadowSize: 0
            },
            grid: {
                color: '#646464',
                borderColor: 'transparent',
                borderWidth: 20,
                hoverable: true
            },
            xaxis: {
                tickColor: 'transparent',
                tickDecimals: 0
            },
            yaxis: {
                tickSize: 1000
            }
        });
        $('#graph-bars').hide();

        $('#lines').on('click', function (e) {
            $('#bars').removeClass('active');
            $('#graph-bars').fadeOut();
            $(this).addClass('active');
            $('#graph-lines').fadeIn();
            e.preventDefault();
        });

        $('#bars').on('click', function (e) {
            $('#lines').removeClass('active');
            $('#graph-lines').fadeOut();
            $(this).addClass('active');
            $('#graph-bars').fadeIn().removeClass('hidden');
            e.preventDefault();
        });

        function showTooltip(x, y, contents) {
            $('<div id="tooltip">' + contents + '</div>').css({
                top: y - 16,
                left: x + 20
            }).appendTo('.container').fadeIn();
        }

        var previousPoint = null;

        $('#graph-lines, #graph-bars').bind('plothover', function (event, pos, item) {
            if (item) {
                if (previousPoint != item.dataIndex) {
                    previousPoint = item.dataIndex;
                    $('#tooltip').remove();
                    var x = item.datapoint[0],
                        y = item.datapoint[1];
                        showTooltip(item.pageX, item.pageY, y + ' readers on the' + x + 'th');
                }
            } else {
                $('#tooltip').remove();
                previousPoint = null;
            }
        });

        $('.chart-visitors').easyPieChart({
            animate: 3000,
            barColor : '#4761e2',
            lineWidth : 20,
            lineCap: 'butt',
            size: 150
        });

        $('.chart-downloads').easyPieChart({
            animate: 4200,
            barColor : '#4761e2',
            lineWidth : 20,
            lineCap: 'butt',
            size: 150
        });

    }//end check if graph exists

    var fullHeight = $(window).height();

    $('.hero-image-404').css("height", fullHeight );


});

$(function() {
    function mediaProviderName(url, type) {
        if (type === 'issuu') {
            return 'Issuu';
        }
        if (/soundcloud\.com/.test(url)) {
            return 'SoundCloud';
        }
        if (/youtube\.com|youtu\.be/.test(url)) {
            return 'YouTube';
        }
        if (/vimeo\.com/.test(url)) {
            return 'Vimeo';
        }
        if (/slides\.com/.test(url)) {
            return 'Slides';
        }
        if (/ccma\.cat|tv3\.cat/.test(url)) {
            return 'CCMA';
        }
        if (type === 'image') {
            return 'Recurs visual';
        }
        return 'Contingut extern';
    }

    function mediaTypeFromUrl(url) {
        if (/\.(jpe?g|png|gif|webp|bmp)(\?|#|$)/i.test(url)) {
            return 'image';
        }
        return 'iframe';
    }

    function upgradeMediaPlaceholder($placeholder) {
        var $link = $placeholder.find('a[href]').first();
        var src = $placeholder.data('src') || ($link.length ? $link.attr('href') : '');
        var type = $placeholder.data('media-type') || (src ? mediaTypeFromUrl(src) : '');
        var title = $placeholder.data('media-title') || mediaProviderName(src, type);
        var fallback = src;

        if (!type && !$placeholder.data('configid')) {
            return;
        }

        $placeholder
            .addClass('media-placeholder')
            .attr('data-media-type', type);

        if (src) {
            $placeholder.attr('data-src', src);
        }

        var actions = '<button type="button" class="media-placeholder__button js-media-load">Carrega el contingut aquí</button>';
        if (fallback) {
            actions += '<a class="media-placeholder__link" href="' + fallback + '" target="_blank" rel="noopener noreferrer">Obre en pestanya nova</a>';
        }

        $placeholder.html(
            '<div class="media-placeholder__body">' +
                '<h3 class="media-placeholder__title">' + title + '</h3>' +
                '<p class="media-placeholder__text">Aquest contingut extern es carregarà només quan el demanis.</p>' +
                actions +
            '</div>'
        );
    }

    function loadIssuu($placeholder) {
        var configId = $placeholder.data('configid');
        if (!configId) {
            return;
        }

        $placeholder.addClass('is-loaded').html(
            '<div data-configid="' + configId + '" style="width:100%; height:100%;" class="issuuembed"></div>'
        );

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://e.issuu.com/embed.js';
        document.body.appendChild(script);
    }

    function loadInlineMedia($placeholder) {
        if ($placeholder.hasClass('is-loaded')) {
            return;
        }

        var type = $placeholder.attr('data-media-type');
        var src = $placeholder.attr('data-src');

        if (type === 'issuu') {
            loadIssuu($placeholder);
            return;
        }

        if (!src) {
            return;
        }

        if (type === 'image') {
            $placeholder.addClass('is-loaded').html(
                '<img class="media-placeholder__image img-responsive img-thumbnail" src="' + src + '" alt="">'
            );
            return;
        }

        var allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        $placeholder.addClass('is-loaded').html(
            '<iframe class="media-placeholder__frame" src="' + src + '" allow="' + allow + '" allowfullscreen></iframe>'
        );
    }

    $('.external-embed-placeholder, .media-placeholder').each(function() {
        upgradeMediaPlaceholder($(this));
    });

    $(document).on('click', '.js-media-load', function(event) {
        event.preventDefault();
        loadInlineMedia($(this).closest('.media-placeholder'));
    });
});


    // by Marc Català! Thank you!

$(document).ready(function() {
    var url = document.location.pathname;
    var match = url.match(/\/(\d+)\//);
    if (!match) {
        return;
    }
    var num = match[1];
    var headerImg = 'background-header.opt.webp';

    if (num) {
        var nextpage = url.replace("/" + num + "/i", "/" + ++num + "/i");
        $.ajax({
            url: nextpage,
            success: function(result){
                var $footer = $("div.single-footer");
                $footer.addClass('fons-pas-' + num).addClass('hero-image');
                $footer.on("click", function(){
                    document.location = document.location.protocol + nextpage;
                });
            }
        });
    }
});
