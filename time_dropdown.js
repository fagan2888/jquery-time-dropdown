/*global $ */

(function( $ ){

    $.fn.time_picker = function( method ) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.time_picker' );
        }
    };

    var methods = {
        init : function( options ) {
                var settings = $.extend( {
                    'choices' : ["19:00", "19:30", "20:00", "20:30"],
                    'placeholder' : "noon/10:35 PM/22:15/midnight/2AM"
                }, options);
            return this.each(function () {
                var text_field = $(this);
                var time_list = settings['choices'];
                var r, t, pt = text_field.val() || time_list[0];
                r = '<select>';
                for (t=0;t<time_list.length;t++) {
                    var hm = parse_time(time_list[t]);
                    var hour, minute;
                    hour = hm[0];
                    minute = hm[1];
                    r += '<option value="' + time_as_24hour(hour, minute) + '">' + time_as_ampm(hour, minute); '</option>';
                }
                r += '<option value="other">Other time...</option>';
                r += '</select>';
                var new_item = $(r);
                var new_class = settings['class'] || text_field.attr("class");
                if (new_class) {
                    new_item.attr("class", new_class);
                }
                text_field.before(new_item);
                text_field.data("time_dropdown", new_item);
                text_field.hide();

                new_item.bind("change.time_dropdown", function (e) {
                    var which = $(e.target).find("option:selected");
                    if (which.val() === "other") {
                        var old_val = text_field.val();
                        new_item.hide();
                        text_field.show();
                        text_field.attr("placeholder", settings['placeholder']);
                        function selected() {
                            new_item.show();
                            text_field.hide();
                            var pt = text_field.time_picker("set_time", text_field.val());
                            if (pt===undefined) {
                                text_field.time_picker("set_time", old_val);
                            }
                        }
                        text_field.one("blur", selected);
                        text_field.keypress(function(e) {
                            if ( e.which == 13 ) {
                                selected();
                                return false;
                            }
                            return true;
                        });
                        text_field.val("");
                        text_field.focus();
                    } else {
                        text_field.val(which.val());
                        text_field.trigger("change");
                    }
                });
                text_field.time_picker("set_time", pt);
            });
        },
        set_time : function( when ) {
            var select = $(this).data("time_dropdown");
            var exp_val = parse_time(when);
            if (exp_val === undefined) return;
            var hour = exp_val[0];
            var minute = exp_val[1];

            var new_time = time_as_24hour(hour, minute);
            $(this).val(new_time);
            select.val(new_time);

            if (select.val() !== new_time) {
                var new_option = $('<option value="' + new_time + '">' + time_as_ampm(hour, minute) + '</option>');
                var insert_here = select.find("option:last");
                insert_here.before(new_option);
                select.val(new_time);
            }
            return new_time;
        }
    };

    function parse_time(time_string) {
        var ampmhours, hour, minute, parts, suffix, match;
        var time_re = /^\s*(\d{1,2})\:?(\d\d)?(\:\d\d)?\s*([AP]M)?\s*$/;
        time_string = time_string.toUpperCase();
        if (time_string === 'MIDNIGHT') {
            return [0, 0];
        }
        if (time_string === 'NOON') {
            return [12, 0];
        }
        match = time_string.match(time_re);
        if (!match) {
            return undefined;
        }
        suffix = match[4];
        if (suffix === 'AM') {
            ampmhours = 0;
        }
        if (suffix === 'PM') {
            ampmhours = 12;
        }
        hour = Number(match[1]);
        if (ampmhours !== undefined) {
            // 12 AM corresponds to 0 and 12 PM to 12. So 12 is really 0.
            hour %= 12;
            hour += ampmhours;
        }
        minute = 0;
        if (match[2]) {
            minute = Number(match[2]);
            if (minute>59) {
                return undefined;
            }
        }
        return [hour, minute];
    }

    function time_as_ampm(hour, minute) {
        var ampm = 'AM';
        if ((minute === 0) && (hour % 12 === 0)) {
            if (hour === 0) {
                return "midnight";
            }
            return "noon";
        }
        if (hour>=12) {
            hour -= 12;
            ampm = 'PM';
        }
        if (hour===0) {
            hour = 12;
        }
        return hour + ":" + with_leading_0(minute) + " " + ampm;
    }

    function with_leading_0(minute) {
        if (minute < 10) {
            return "0" + minute;
        }
        return "" + minute;
    }

    function time_as_24hour(hour, minute) {
        return hour + ":" + with_leading_0(minute);
    }
})( jQuery );
