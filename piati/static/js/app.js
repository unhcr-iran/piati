LOCALES = {
    "fr": {
        "decimal": ",",
        "thousands": "\xa0",
        "grouping": [3],
        "currency": ["", " €"],
        "dateTime": "%A, %e %B %Y г. %X",
        "date": "%d.%m.%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        "shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
        "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        "shortMonths": ["jan.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
        }
};


function PiatiMap (selector, projects, options) {
    options = options || {};

    var map = new L.Map(selector, {scrollWheelZoom: false, center: [32.5, 36], zoom: 6});
    var tilelayer = new L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: options.zoom || 12,
        attribution: 'Data © OpenStreetMap contributors, tiles © HOT contributors'
    }).addTo(map);

    var clusterOptions = {
            polygonOptions: {
                color: '#123456'
            }
        },
        projectsLayer = new L.MarkerClusterGroup(clusterOptions).addTo(map);
    function projectToMarkers (project) {
        var template = "<h3>{name}</h3><a href='{url}'>{projectName}</a>";
        var addMarker = function (location) {
            if (!location.lat || !location.lng) return;
            var icon = new L.DivIcon({ html: '<div><span>1</span></div>', className: 'marker-cluster', iconSize: new L.Point(40, 40) }),
                marker = L.marker([location.lat, location.lng], {icon: icon});
            marker.bindPopup(L.Util.template(template, {name: location.name, url: project.url, projectName: project.name}));
            projectsLayer.addLayer(marker);
        };
        if (project.locations) {
            for (var i = 0; i < project.locations.length; i++) {
                addMarker(project.locations[i]);
            }
        }
    }

    this.update = function (projects) {
        projectsLayer.clearLayers();
        for(var id in projects) {
            projectToMarkers(projects[id]);
        }
        if (options.fitBounds && projectsLayer.getBounds().isValid()) {
            map.fitBounds(projectsLayer, {reset: true, maxZoom: 8});
        }
    };
    this.update(projects);
    this.map = map;
    return this;
}

Array.prototype.flattenMap = function(func /*, thisArg */)
{
    "use strict";

    if (this === void 0 || this === null) throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof func !== "function") throw new TypeError();

    var res = [], r;
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++)
    {
        if (i in t) {
            r = func.call(thisArg, t[i], i, t);
            if (r instanceof Array) {
                res = res.concat(r);
            } else {
                res.push(r);
            }
        }
    }

    return res;
};


var PiatiPie = function (el, accessor, options) {
    options = options || {};

    var cv_w = options.width || 300,                        //width
        cv_h = options.height || 210,                            //height
        cv_r = options.radius || 100,                            //radius
        cv_color = d3.scale.category20b();     //builtin range of colors
  
    var cv_svg = d3.select(el)
        .classed('piati-chart', true)
        .append("svg:svg")              //create the SVG element inside the <body>
        .attr("width", cv_w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
        .attr("height", cv_h)
        .append("svg:g")                //make a group to hold our pie chart
        .attr("transform", "translate(" + cv_r + "," + cv_r + ")");    //move the center of the pie chart from 0, 0 to radius, radius

    var cv_arc = d3.svg.arc()              //this will create <path> elements for us using arc data
        .outerRadius(cv_r);

    var cv_pie = d3.layout.pie()           //this will create arc data for us given a list of values
        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array


    this.updateWith = function () {
        var data = typeof accessor === "function" ? accessor() : accessor;
        var cv_path = cv_svg.selectAll("path").data(cv_pie(data));
        var cv_text = cv_svg.selectAll("text").data(cv_pie(data));
        cv_path.exit().remove();
        cv_text.exit().remove();
        
        cv_path.enter().append("path");
        cv_path.attr("fill", function(d, i) { return cv_color(i); } )
            .attr("d", cv_arc);
        cv_text.enter()
            .append("text");
        cv_text.attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = cv_r;
                return "translate(" + cv_arc.centroid(d) + ")";
            })
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("fill", "#FFFFFF")
            .attr("font-size", "10px")
            .text(function(d, i) { return "[" + (i + 1) + "]"; });
        
    };
    this.updateWith();
    return this;
};


function Projects(data) {

    var THIS = {

        init: function (data) {
            this.data = data;
            return this;
        },

        getSectorsValues: function (d) {
            return d.sectors.map(function (s) { return s.name; });
        },

        getOrgsValues: function (d) {
            return d.orgs.map(function (s) { return s.name; });
        },

        getTopicsValues: function (d) {
            return d.topics.map(function (s) { return s; });
        },

        getStatusValue: function (d) {
            return d.status;
        },

        getBudgetValue: function (d) {
            return parseInt(d.budget, 10);
        }

    };

    return THIS.init(data);

}

d3.visible = function () {
    return this.style.display !== "none";
};

d3.moneyFormat = function (val) {
    var format;
    if (LOCALE && LOCALES[LOCALE]) {
        var locale = d3.locale(LOCALES[LOCALE]);
        format = locale.numberFormat('$,');
    } else {
            format = function (val) {return d3.format('n')(val) + ' JOD';};
    }
    return format(val);
};

d3.listFilter = function (selection, filters, mainOptions) {

    mainOptions = mainOptions || {};
    var that = this,
        dispatch = d3.dispatch("filter", "change"),
        totalContainer = d3.select(mainOptions.parent).append('div').classed('total', true);
    that.filters = {};
    var displayTotal = function () {
        totalContainer.text(selection.filter(d3.visible).size() + " result(s) on " + selection.size() + " selection(s)");
    };
    var filterData = function (d) {
        var filter;
        for (var i in that.filters) {
            filter = that.filters[i];
            if (!filter.pass(d)) {
                return 'none';
            }
        }
        return null;
    };
    var filter = function () {
        selection.style('display', filterData);
        displayTotal();
        dispatch.filter();
    };
    that.filter = filter;
    var params = function () {
        var params = [];
        for (var i in that.filters) {
            params = params.concat(that.filters[i].params() || []);
        }
        return params;
    };
    that.params = params;
    var update = function (values) {
        for (var i in that.filters) {
            that.filters[i].update(d3.set(values[i]));
        }
        that.filter();
    };
    that.update = update;
    var construct = function (type) {
        var types = {
            checkbox: CHECKBOX,
            radio: RADIO,
            range: RANGE,
            text: TEXT
        }, _ = {};
        for (var i in API) {
            _[i] = API[i];
        }
        for (var j in types[type]) {
            _[j] = types[type][j];
        }
        return _;
    };

    var API = {

        init: function (key, selection, options) {
            this.type = options.type || 'checkbox';
            this.key = key;
            this.selection = selection;
            this.data = selection.data();
            this.label = options.label || 'Filter';
            this.parent = mainOptions.parent || document.body;
            this.accessor = options.accessor || function (d) { return d[key]; };
            this.values = this.getValues();
            if (this.isActive()) {
                this._buildContainer();
                this.build();
                if (mainOptions.defaults) {
                    this.update(d3.set(mainOptions.defaults[this.key]));
                }
            }
            return this;
        },

        _buildContainer: function () {
            this.container = d3.select(this.parent).append('fieldset');
            this.container.node().id = this.key + "Filter";
            this.container.append('legend').text(this.label).on('click', function () {
                d3.select(this.parentNode).classed('on', function () { return !d3.select(this).classed('on');});
            });
            return this.container;
        },

        _accessor: function (d) {
            if (typeof d[this.key] === "string" || typeof d[this.key] === "number" || d[this.key] instanceof Array) {
                return d[this.key];
            } else if (typeof d[this.key] === "function") {
                return d[this.key]();
            } else {
                return d[this.key].value || d[this.key].label || d[this.key].name || d[this.key].title;
            }
        },

        isActive: function () {
            return this.values.length > 1;
        },

        getValues: function () {
            return [];
        },

        pass: function (d) {
            return this.isActive() ? this._pass(d) : true;
        },

        params: function () {
            return this.isActive() && this._params();
        },

        update: function (values) {
            if (!this.isActive()) return;
            if (values.values().length) {
                this.container.classed('on', true);
            }
            this._update(values);
        },

        change: function () {
            dispatch.change();
        }

    };

    var TEXT = {

        build: function () {
            this.input = this.container.append('label').append('input').attr('type', 'text').property('placeholder', 'abc…');
            this.input.on('input', this.change);
        },

        _pass: function (d) {
            return this.accessor(d).toLocaleLowerCase().indexOf(this.value()) !== -1;
        },

        _params: function () {
            return this.value() ? this.key + "=" + encodeURIComponent(this.value()) : [];
        },

        value: function () {
            return (this.input.property('value') || '').toLocaleLowerCase();
        },

        isActive: function () {
            return true;
        },

        _update: function (values) {
            this.input.property('value', values.values()[0] || '');
        }

    };

    var CHECKBOX = {

        getValues: function () {
            return d3.set(this.data.flattenMap(this.accessor)).values();
        },

        build: function () {
            var that = this,
                labels = this.container.selectAll('label').data(this.values);
            labels.enter().append('label').sort(function (a, b) { return a.localeCompare(b); });
            labels.html(function (d) {return "<span> " + d + "</span>";});
            this.inputs = labels.insert('input', 'span').attr('type', this.type).attr('name', this.key).attr('value', function (d) {return d;}).on('click', this.change);
            dispatch.on('filter.' + this.key, function () {
                var values = d3.set(that.selection.filter(d3.visible).data().flattenMap(that.accessor));
                labels.classed('inactive', function (d) {return values.has(d) ? false : true;});
            });
        },

        _update: function (values) {
            this.inputs.each(function (d) {
                this.checked = values.has(d);
            });
        },

        _pass: function (d) {
            var values = d3.set(this.inputs.filter(function () {return this.checked;}).data()),
                pass = true, value;
            if (values.values().length) {
                if (d[this.key] instanceof Array) {
                    pass = false;
                    for (var i = 0; i < d[this.key].length; i++) {
                        if (d[this.key][i] === null) { continue; }
                        value = typeof d[this.key][i] === "object" ? d[this.key][i].name : d[this.key][i];
                        if (values.has(value)) {
                            pass = true;
                            break;
                        }
                    }
                } else {
                    pass = values.has(d[this.key]);
                }
            }
            return pass;
        },

        _params: function () {
            var key = this.key;
            return this.inputs.filter(function () {return this.checked;}).data().map(function (d) {
                return key + '=' + encodeURIComponent(d);
            });
        }

    };

    var RADIO = {

        build: function () {
            CHECKBOX.build.call(this);
            var inputs = this.inputs;
            this.container.append('label').append('small').text('Tout décocher').on('click', function () {
                inputs.each(function () {
                    this.checked = false;
                    that.filter();
                });
            });
        },

        _pass: CHECKBOX._pass,
        _update: CHECKBOX._update,
        _params: CHECKBOX._params,
        getValues: CHECKBOX.getValues

    };

    var RANGE = {

        getValues: function () {
            return this.data.flattenMap(this.accessor);
        },

        build: function () {
            var label = this.container.append('label'), that = this;
            this.min = d3.min(this.values);
            this.max = d3.max(this.values);
            this.slider = d3.slider(label.node(), {
                min: this.min,
                max: this.max,
                step: 100
            });
            this.labelContainer = this.container.append('label');
            this.displayRange();
            this.slider.on('slide', function (e) {
                that.displayRange();
            });
            this.slider.on('slideend', function (e) {
                that.displayRange();
                that.change();
            });
        },

        displayRange: function () {
            this.labelContainer.text(d3.moneyFormat(this.from()) + " — " + d3.moneyFormat(this.to()));
        },

        _update: function (values) {
            var from, to;
            values.forEach(function (d) {
                d = decodeURIComponent(d);
                switch (d.slice(0,1)) {
                    case ">":
                        from = parseInt(d.slice(1), 10);
                        break;
                    case "<":
                        to = parseInt(d.slice(1), 10);
                        break;
                    default:
                        // pass
                }
            });
            this.slider.set(from || this.min, to || this.max);
            this.displayRange();
        },

        from: function () {
            return this.slider.from;
        },

        to: function () {
            return this.slider.to;
        },

        _pass: function (d) {
            return this.accessor(d) >= this.from() && this.accessor(d) <= this.to();
        },

        _params: function () {
            var params = [];
            if (this.from() !== this.min) {
                params.push(this.key + '=' + encodeURIComponent('>' + this.from()));
            }
            if (this.to() !== this.max) {
                params.push(this.key + '=' + encodeURIComponent('<' + this.to()));
            }
            return params;
        }


    };

    var options;
    for (var i in filters) {
        options = filters[i];
        that.filters[i] = construct(options.type || 'checkbox').init(i, selection, options);
    }
    d3.rebind(this, dispatch, 'on');
    return this;
};


function PiatiTabs(options) {

    var API = {

        init: function (options) {
            var that = this;
            this.options = options || {};
            this.separator = this.options.separator || '?';
            this.prefix = this.options.prefix || "tab-";
            this.dispatch = d3.dispatch('show', 'hashchange');
            d3.selectAll('.tabs a').on('click', function () {
                d3.event.preventDefault();
                that.show(this.getAttribute('href'));
                that.hash();
            });
            d3.rebind(this, this.dispatch, 'on');
            window.onhashchange = function (e) { that.hashchange(e);};
            return this;
        },

        show: function (id) {
            id = id || this.getTabFromHash() || this.options.default;
            if (!id) return;
            if (id.substring(0,1) !== "#") id = "#" + this.prefix + id;
            d3.selectAll('.tab-content').classed('on', false);
            d3.selectAll('.tabs a').classed('on', false);
            d3.select(".tabs a[href='" + id + "']").classed('on', true);
            d3.select(id).classed('on', true);
            this.dispatch.show(id.substr(5));
        },

        hash: function () {
            var node = d3.select('.tab-content.on').node(),
                tab = node ? node.id.substr(4) : this.options.default;
            if (this.options.hashFunc) {
                var params = this.options.hashFunc(tab);
                if (params.length) tab += this.separator + params.join('&');
            }
            window.location.hash = tab;
        },

        hashchange: function (e) {
            this.dispatch.hashchange();
            this.show();
        },

        getHashElements: function () {
            return window.location.hash.substr(1).split(this.separator);
        },

        getTabFromHash: function () {
            return this.getHashElements()[0];
        },

        getHashExtraParams: function () {
            var hash = this.getHashElements();
            var hashParams = {};
            if (hash[1]) {
                var params = hash[1].split('&'), param;
                for (var i = 0; i < params.length; i++) {
                    param = params[i].split('=');
                    hashParams[param[0]] = hashParams[param[0]] || [];
                    hashParams[param[0]].push(decodeURIComponent(param[1]));
                }
            }
            return hashParams;
        }
    };

    return API.init(options);
}


function PiatiProjectsBrowser(projects, options) {

    var API = {

        init: function (options) {
            var that = this;
            this.sortDiv = d3.select('#tab-data').insert('div').classed('sort', true).text('Sort by ');
            this.sorts = {
                name: "Title",
                budget: "budget"
            };
            for (var key in this.sorts) {
                this.addSort(key);
            }

            this.list = d3.select('#tab-data')
                          .selectAll('li')
                          .data(projects.data);
            this.list.enter().append("li");
            this.list.html(this.renderProject);
            this.mapHandler = new PiatiMap('tab-map', projects.data);

            this.tabHandler = PiatiTabs({hashFunc: function (tab) { return that._hashFunc(tab);}, default: 'data'});
            this.tabHandler.on('show', function () {
                that.mapHandler.map.invalidateSize();
            });
            var hashParams = this.tabHandler.getHashExtraParams();

            var filters = {
                name: {label: "Search by Title", type: 'text'},
                status: {label: "Status", type: "radio"},
                sectors: {accessor: projects.getSectorsValues, label: "Sectors"},
                orgs: {accessor: projects.getOrgsValues, label: "Implementing Agencies"},
                topics: {label: "Thèmes"},
                flow: {label: "Flux", type: "radio"},
                aid_type: {label: "Type d'aide", type: "radio"},
                budget: {type: "range", label: "Budget"}
            };

            this.filtersHandler = d3.listFilter(this.list, filters, {parent: "#piatiFilters", defaults: hashParams});
            this.tabHandler.on('hashchange', function () {
                var hashParams = that.tabHandler.getHashExtraParams();
                that.filtersHandler.update(hashParams);
                that.filtersHandler.filter();
            });

            this.filtersHandler.on('filter', function () {
                that.mapHandler.update(that.visibleData());
            });
            this.filtersHandler.on('change', function () {
                that.tabHandler.hash();
            });
            if (hashParams.sort) {
                var els = decodeURIComponent(hashParams.sort[0]).split(' '),
                    key = els[0],
                    mode = els[1];
                if (this.sorts[key]) {
                    this.sort(key, mode);
                }
            }
            this.filtersHandler.filter();
            this.tabHandler.show();

            return this;
        },

        renderProject: function (d) {
            var content = '';
            content += "<h4><a href='" + d.url + "''>" + d.name + "</a> <small>[" + d.id + "]</small></h4>";
            content += "<div>Budget: " + d3.moneyFormat(d.budget) + "</div>";
            content += "<div>Status: " + d.status + "</div>";
            content += "<div>Source: " + d.source.name + "</div>";
            content += "<hr />";
            return content;
        },

        visible: function () {
            return this.list.filter(API.isVisible);
        },

        visibleData: function () {
            return this.visible().data();
        },

        computeStats: function (key, prop) {
            var values = d3.map(), sector;
            var increment = function (key) {
                if (prop) {
                    key = key[prop];
                }
                if (!values.has(key)) {
                    values.set(key, {
                        value: 0,
                        label: key
                    });
                }
                values.get(key).value++;
            };
            this.visible().each(function (d) {
                if (d[key] instanceof Array) {
                    for (var i = 0; i < d[key].length; i++) {
                        increment(d[key][i]);
                    }
                } else {
                    increment(d[key]);
                }
            });
            return values.values();
        },

        _hashFunc: function (tab) {
            var params = this.filtersHandler.params(),
                sort = d3.select('.sort a.asc').node() || d3.select('.sort a.desc').node();
            if (sort) {
                params.push('sort=' + encodeURIComponent(sort.className));
            }
            return params;
        },

        sort: function (key, mode) {
            var button = this.sortDiv.select('a.' + key),
                desc = mode? mode === 'desc' : button.classed('asc');
            this.sortDiv.selectAll('a').classed('asc desc', false);
            button.classed('desc', function () {return desc === true;});
            button.classed('asc', function () {return desc === false;});
            var stringComparator = function (a, b) {
                return desc ? b[key].localeCompare(a[key]) : a[key].localeCompare(b[key]);
            };
            var numberComparator = function (a, b) {
                return desc ? b[key] - a[key] : a[key] - b[key];
            };
            this.list.sort(typeof this.list.data()[0][key] === "string" ? stringComparator : numberComparator);
            this.tabHandler.hash();
        },

        addSort: function (key) {
            var that = this;
            this.sortDiv.append('a').classed(key, true).text(this.sorts[key]).on('click', function () {that.sort(key);});
        },

        /* *************** */
        /* *** HELPERS *** */
        /* *************** */

        bind: function (fn, obj) {
            var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
            return function () {
                return fn.apply(obj, args || arguments);
            };
        },

        isVisible: function (d) {
            return this.style.display !== "none";
        },

        idFromProperty: function (prop) {
            return '#' + prop + 'Filter';
        }

    };

    return API.init(options);
}

function listenFeedbackForm (el) {
    d3.select(el).selectAll('option').each(function () { if (this.value === decodeURIComponent(window.location.hash.substr(1))) this.selected = 'selected'; });
    d3.select(el).on('submit', function () {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        var that = this;

        function error (msg) {
            return alert(msg || 'Désolé, une erreur est survenue.');
        }
        function success () {
            d3.select(that).transition().duration(500).style('opacity', 0).each('end', function () {
                d3.select(that.parentNode).insert('div', 'form').html('Le message a bien été envoyé. Il sera traité dans les plus brefs délais.<br />Merci d\'avoir pris le temps de nous contacter.').classed('notice', true);
            });
        }
        var email = this.elements.email.value,
            message = this.elements.message.value,
            project = this.elements.project.options[this.elements.project.selectedIndex].value;
        if (!message) {
            return error('Oops, le message est vide');
        }
        if (!project) {
            return error('Merci de sélectionner un projet');
        }
        var r = d3.xhr(this.action),
            data = "email=" + encodeURIComponent(email) + "&message=" + encodeURIComponent(message) + "&project=" + encodeURIComponent(project);
        r.header("Content-Type", "application/x-www-form-urlencoded").post(data, function (err, xhr) {
            if (arguments.length === 2) {
                var response = JSON.parse(xhr.responseText);
                if (response.success) {
                    success();
                } else {
                    error();
                }
            } else {
                error();
            }
        });
    });

}