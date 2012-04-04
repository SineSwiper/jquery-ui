/*
 * jQuery UI Effects @VERSION
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/
 */
;jQuery.effects || (function($, undefined) {

var backCompat = $.uiBackCompat !== false;

$.effects = {
	effect: {}
};

/******************************************************************************/
/****************************** COLOR ANIMATIONS ******************************/
/******************************************************************************/

// override the animation for color styles
$.each(["backgroundColor", "borderBottomColor", "borderLeftColor",
	"borderRightColor", "borderTopColor", "borderColor", "color", "outlineColor"],
function(i, attr) {
	$.fx.step[attr] = function(fx) {
		if (!fx.colorInit) {
			fx.start = getColor(fx.elem, attr);
			fx.end = getRGB(fx.end);
			fx.colorInit = true;
		}

		fx.elem.style[attr] = "rgb(" +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0], 10), 255), 0) + "," +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1], 10), 255), 0) + "," +
			Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2], 10), 255), 0) + ")";
	};
});

// Color Conversion functions from highlightFade
// By Blair Mitchelmore
// http://jquery.offput.ca/highlightFade/

// Parse strings looking for color tuples [255,255,255]
function getRGB(color) {
		var result;

		// Check if we're already dealing with an array of colors
		if ( color && color.constructor === Array && color.length === 3 )
				return color;

		// Look for rgb(num,num,num)
		if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color))
				return [parseInt(result[1],10), parseInt(result[2],10), parseInt(result[3],10)];

		// Look for rgb(num%,num%,num%)
		if (result = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(color))
				return [parseFloat(result[1])*2.55, parseFloat(result[2])*2.55, parseFloat(result[3])*2.55];

		// Look for #a0b1c2
		if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color))
				return [parseInt(result[1],16), parseInt(result[2],16), parseInt(result[3],16)];

		// Look for #fff
		if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color))
				return [parseInt(result[1]+result[1],16), parseInt(result[2]+result[2],16), parseInt(result[3]+result[3],16)];

		// Look for rgba(0, 0, 0, 0) == transparent in Safari 3
		if (result = /rgba\(0, 0, 0, 0\)/.exec(color))
				return colors["transparent"];

		// Otherwise, we're most likely dealing with a named color
		return colors[$.trim(color).toLowerCase()];
}

function getColor(elem, attr) {
		var color;

		do {
				color = $.css(elem, attr);

				// Keep going until we find an element that has color, or we hit the body
				if ( color != "" && color !== "transparent" || $.nodeName(elem, "body") )
						break;

				attr = "backgroundColor";
		} while ( elem = elem.parentNode );

		return getRGB(color);
};

// Some named colors to work with
// From Interface by Stefan Petre
// http://interface.eyecon.ro/

var colors = {
	aqua:[0,255,255],
	azure:[240,255,255],
	beige:[245,245,220],
	black:[0,0,0],
	blue:[0,0,255],
	brown:[165,42,42],
	cyan:[0,255,255],
	darkblue:[0,0,139],
	darkcyan:[0,139,139],
	darkgrey:[169,169,169],
	darkgreen:[0,100,0],
	darkkhaki:[189,183,107],
	darkmagenta:[139,0,139],
	darkolivegreen:[85,107,47],
	darkorange:[255,140,0],
	darkorchid:[153,50,204],
	darkred:[139,0,0],
	darksalmon:[233,150,122],
	darkviolet:[148,0,211],
	fuchsia:[255,0,255],
	gold:[255,215,0],
	green:[0,128,0],
	indigo:[75,0,130],
	khaki:[240,230,140],
	lightblue:[173,216,230],
	lightcyan:[224,255,255],
	lightgreen:[144,238,144],
	lightgrey:[211,211,211],
	lightpink:[255,182,193],
	lightyellow:[255,255,224],
	lime:[0,255,0],
	magenta:[255,0,255],
	maroon:[128,0,0],
	navy:[0,0,128],
	olive:[128,128,0],
	orange:[255,165,0],
	pink:[255,192,203],
	purple:[128,0,128],
	violet:[128,0,128],
	red:[255,0,0],
	silver:[192,192,192],
	white:[255,255,255],
	yellow:[255,255,0],
	transparent: [255,255,255]
};


/******************************************************************************/
/****************************** CLIP ANIMATIONS *******************************/
/******************************************************************************/

// XXX: Unit conversion might be better placed in jQuery Core
var rfxnum = /^([\d+.\-]+)([a-z%]*)$/i;

$.fx.step.clip = function(fx) {
	if (fx.state == 0) {  // This is a roundabout fx.custom overload
		var $elem = $(fx.elem);
		fx.start = $elem.css('clipRect');

		// defaults, per CSS2.1 11.1.2
		// 'auto' means the same as '0' for <top> and <left>
		// width plus the sum of the horizontal padding and border widths for <right>
		// height plus the sum of vertical padding and border widths for <bottom>
		var defaults = [0, $elem.outerWidth(), $elem.outerHeight(), 0];

		var sUnits;
		$.each(['start', 'end'],
			function(i, attr) {
				// define quad as a 4-item Array
				var quad;
				if (typeof fx[attr] === 'object') quad = fx[attr];
				else {
					var cRE = fx[attr].match(/^rect\(([\w\s\.\,]+)\)$/);
					quad = (cRE && cRE[1]) ? cRE[1].split(/[\s\,]+/) : [];

					for (var i = 0; i <= 3; i++) {
						if (isNaN(parseInt(quad[i])) || typeof quad[i] === 'undefined') quad[i] = 'auto';
					}
				}

				// check units & convert numbers
				var units = [];
				for (var i = 0; i <= 3; i++) {
					if (quad[i] === 'auto') {
						if (attr === 'start') {
							quad[i]  = defaults[i];
							units[i] = 'px';
						}
						else units[i] = 'auto';
					}
					else {
						var parts = rfxnum.exec(quad[i]);
						quad[i]  = parseInt(parts ? parts[1] : quad[i]);
						units[i] = parts ? parts[2] : 'px';
					}

					// convert units if necessary
					if (attr === 'end' && units[i] != sUnits[i] && units[i] !== 'auto')
						fx.start[i] = $elem.cssUnitConvert(fx.start[i], { 
							startUnit: sUnits[i],
							endUnit:   units[i],
							isHoriz:   i % 2
						});
				}
				if (attr === 'end') fx.unit = units;
				else                sUnits  = units;

				for (var i = 0; i <= 3; i++) {
					if (quad[i] == 'auto') quad[i] = defaults[i];
				}

				fx[attr] = quad;
			}
		);
	}

	var rectArr = [];
	for (var i = 0; i <= 3; i++) {
		rectArr[i] = (fx.unit[i] === 'auto') ? fx.unit[i] : Math.round((fx.pos * (fx.end[i] - fx.start[i])) + fx.start[i]) + fx.unit[i];
	}
	fx.elem.style.clip = fx.now = 'rect(' + rectArr.join(', ') + ')';
};

$.fx.step['clipRect'] = $.fx.step.clip;

$.each(['clipTop', 'clipRight', 'clipBottom', 'clipLeft'],
function(i, attr) {
	$.fx.step[attr] = function(fx) {
		if (fx.state == 0) {
			var $elem = $(fx.elem);
			var defaults = [0, $elem.outerWidth(), $elem.outerHeight(), 0];
			var i = $.cssHooks.clipRect.arrMatch[attr];

			fx.start = $elem.css(attr);
			var parts = rfxnum.exec(fx.start);

			// replace 'auto', if necessary
			if (fx.start === 'auto') fx.start = defaults[i];

			// check unit mismatches
			if (parts && parts[2] && parts[2] !== fx.unit)
				fx.start = $elem.cssUnitConvert(fx.start[i], { 
					startUnit: parts[2],
					endUnit:   fx.unit,
					isHoriz:   i % 2
				});
			else fx.start = fx.cur();
		}

		$.cssHooks[attr].set(fx.elem, Math.round(fx.now) + fx.unit);
	};
});

/******************************************************************************/
/****************************** CLASS ANIMATIONS ******************************/
/******************************************************************************/

var classAnimationActions = [ "add", "remove", "toggle" ],
	shorthandStyles = {
		border: 1,
		borderBottom: 1,
		borderColor: 1,
		borderLeft: 1,
		borderRight: 1,
		borderTop: 1,
		borderWidth: 1,
		margin: 1,
		padding: 1
	},
	// prefix used for storing data on .data()
	dataSpace = "ui-effects-";

$.each([ "borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle" ], function( _, prop ) {
	$.fx.step[ prop ] = function( fx ) {
		if ( fx.end !== "none" && !fx.setAttr || fx.pos === 1 && !fx.setAttr ) {
			jQuery.style( fx.elem, prop, fx.end );
			fx.setAttr = true;
		}
	};
});

function getElementStyles() {
	var style = this.ownerDocument.defaultView
			? this.ownerDocument.defaultView.getComputedStyle( this, null )
			: this.currentStyle,
		newStyle = {},
		key,
		camelCase,
		len;

	// webkit enumerates style porperties
	if ( style && style.length && style[ 0 ] && style[ style[ 0 ] ] ) {
		len = style.length;
		while ( len-- ) {
			key = style[ len ];
			if ( typeof style[ key ] === "string" ) {
				newStyle[ $.camelCase( key ) ] = style[ key ];
			}
		}
	} else {
		for ( key in style ) {
			if ( typeof style[ key ] === "string" ) {
				newStyle[ key ] = style[ key ];
			}
		}
	}

	return newStyle;
}


function styleDifference( oldStyle, newStyle ) {
	var diff = {},
		name, value;

	for ( name in newStyle ) {
		value = newStyle[ name ];
		if ( oldStyle[ name ] != value ) {
			if ( !shorthandStyles[ name ] ) {
				if ( $.fx.step[ name ] || !isNaN( parseFloat( value ) ) ) {
					diff[ name ] = value;
				}
			}
		}
	}

	return diff;
}

$.effects.animateClass = function( value, duration, easing, callback ) {
	var o = $.speed( duration, easing, callback );

	return this.queue( function() {
		var animated = $( this ),
			baseClass = animated.attr( "class" ) || "",
			applyClassChange,
			allAnimations = o.children ? animated.find( "*" ).andSelf() : animated;

		// map the animated objects to store the original styles.
		allAnimations = allAnimations.map(function() {
			var el = $( this );
			return {
				el: el,
				start: getElementStyles.call( this )
			};
		});

		// apply class change
		applyClassChange = function() {
			$.each( classAnimationActions, function(i, action) {
				if ( value[ action ] ) {
					animated[ action + "Class" ]( value[ action ] );
				}
			});
		};
		applyClassChange();

		// map all animated objects again - calculate new styles and diff
		allAnimations = allAnimations.map(function() {
			this.end = getElementStyles.call( this.el[ 0 ] );
			this.diff = styleDifference( this.start, this.end );
			return this;
		});

		// apply original class
		animated.attr( "class", baseClass );

		// map all animated objects again - this time collecting a promise
		allAnimations = allAnimations.map(function() {
			var styleInfo = this,
				dfd = $.Deferred();

			this.el.animate( this.diff, {
				duration: o.duration,
				easing: o.easing,
				queue: false,
				complete: function() {
					dfd.resolve( styleInfo );
				}
			});
			return dfd.promise();
		});

		// once all animations have completed:
		$.when.apply( $, allAnimations.get() ).done(function() {

			// set the final class
			applyClassChange();

			// for each animated element,
			// clear all css properties that were animated
			$.each( arguments, function() {
				var el = this.el;
				$.each( this.diff, function(key) {
					el.css( key, '' );
				});
			});

			// this is guarnteed to be there if you use jQuery.speed()
			// it also handles dequeuing the next anim...
			o.complete.call( animated[ 0 ] );
		});
	});
};

$.fn.extend({
	_addClass: $.fn.addClass,
	addClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.apply( this, [{ add: classNames }, speed, easing, callback ]) :
			this._addClass(classNames);
	},

	_removeClass: $.fn.removeClass,
	removeClass: function( classNames, speed, easing, callback ) {
		return speed ?
			$.effects.animateClass.apply( this, [{ remove: classNames }, speed, easing, callback ]) :
			this._removeClass(classNames);
	},

	_toggleClass: $.fn.toggleClass,
	toggleClass: function( classNames, force, speed, easing, callback ) {
		if ( typeof force === "boolean" || force === undefined ) {
			if ( !speed ) {
				// without speed parameter;
				return this._toggleClass( classNames, force );
			} else {
				return $.effects.animateClass.apply( this, [( force ? { add:classNames } : { remove:classNames }), speed, easing, callback ]);
			}
		} else {
			// without force parameter;
			return $.effects.animateClass.apply( this, [{ toggle: classNames }, force, speed, easing ]);
		}
	},

	switchClass: function( remove, add, speed, easing, callback) {
		return $.effects.animateClass.apply( this, [{
				add: add,
				remove: remove
			}, speed, easing, callback ]);
	}
});

/******************************************************************************/
/********************************** CSS HOOKS *********************************/
/******************************************************************************/

$.extend( $.cssHooks, {
	clip: {
		get: function( elem, computed, extra ) {
			// IE refuses to return 'clip'
			// but has no problem with 'clipTop' and the likes
			// This unpleasantness reconstructs what a "good" browser would return
			return (!elem.style.clip && elem.currentStyle) ?
			'rect(' + elem.css('clipRect').join(', ') + ')'
			: elem.style.clip;
		},
		set: function( elem, value ) {
			elem.style.clip = value;
		}
	},

	clipRect: {
		get: function(elem, computed, extra) {
			// IE
			var cs = elem.currentStyle;
			if (cs && typeof cs.clipTop != 'undefined') return [cs.clipTop, cs.clipRight, cs.clipBottom, cs.clipLeft];

			// Others
			var clip = elem.style.clip;
			var cRE  = clip.match(/^rect\(([\w\s\.\,]+)\)$/);
			if (!cRE || !cRE[1]) return ['auto','auto','auto','auto'];
			var quad = cRE[1].split(/[\s\,]+/);

			for (var i = 0; i <= 3; i++) {
				if (isNaN(parseInt(quad[i])) || typeof quad[i] === 'undefined') quad[i] = 'auto';
			}

			return quad;
		},
		set: function(elem, value) {
			if (typeof value === 'string') return $(elem).css('clip', value);
			if (typeof value === 'object') return $(elem).css('clip', 'rect(' + value.join(', ') + ')');
			return null;
		},
		arrMatch: {
			clipTop:    0,
			clipRight:  1,
			clipBottom: 2,
			clipLeft:   3
		}
	}
});

$.each(['clipTop', 'clipRight', 'clipBottom', 'clipLeft'],
function(i, attr) {
	$.cssHooks[attr] = {
		get: function(elem, computed, extra) {
			var val;
			// IE
			var cs = elem.currentStyle;
			if (cs && typeof cs[attr] != 'undefined') val = cs[attr];
			// Others
			else {
				var quad = $(elem).css('clipRect');
				val = quad[$.cssHooks.clipRect.arrMatch[attr]];
			}
			
			// if something is asking for a single value here,
			// we should expand 'auto' to the proper px equiv
			if (val == 'auto' || isNaN(parseInt(val))) {
				var $elem = $(elem);
				var defaults = [0, $elem.outerWidth(), $elem.outerHeight(), 0];
				val = defaults[$.cssHooks.clipRect.arrMatch[attr]];
			}
			
			return val;
		},
		set: function( elem, value ) {
			var quad = $(elem).css('clipRect');
			quad[$.cssHooks.clipRect.arrMatch[attr]] = value;
			return $(elem).css('clipRect', quad);
		}
	};
});

/******************************************************************************/
/*********************************** EFFECTS **********************************/
/******************************************************************************/

$.extend( $.effects, {
	version: "@VERSION",

	// Saves a set of properties in a data storage
	save: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.data( dataSpace + set[ i ], element[ 0 ].style[ set[ i ] ] );
			}
		}
	},

	// Restores a set of previously saved properties from a data storage
	restore: function( element, set ) {
		for( var i=0; i < set.length; i++ ) {
			if ( set[ i ] !== null ) {
				element.css( set[ i ], element.data( dataSpace + set[ i ] ) );
			}
		}
	},

	setMode: function( el, mode ) {
		if (mode === "toggle") {
			mode = el.is( ":hidden" ) ? "show" : "hide";
		}
		return mode;
	},

	// Translates a [top,left] array into a baseline value
	// this should be a little more flexible in the future to handle a string & hash
	getBaseline: function( origin, original ) {
		var y, x;
		switch ( origin[ 0 ] ) {
			case "top": y = 0; break;
			case "middle": y = 0.5; break;
			case "bottom": y = 1; break;
			default: y = origin[ 0 ] / original.height;
		};
		switch ( origin[ 1 ] ) {
			case "left": x = 0; break;
			case "center": x = 0.5; break;
			case "right": x = 1; break;
			default: x = origin[ 1 ] / original.width;
		};
		return {
			x: x,
			y: y
		};
	},

	// Wraps the element around a wrapper that copies position properties
	createWrapper: function( element ) {

		// if the element is already wrapped, return it
		if ( element.parent().is( ".ui-effects-wrapper" )) {
			return element.parent();
		}

		// wrap the element
		var props = {
				width: element.outerWidth(true),
				height: element.outerHeight(true),
				"float": element.css( "float" )
			},
			wrapper = $( "<div></div>" )
				.addClass( "ui-effects-wrapper" )
				.css({
					fontSize: "100%",
					background: "transparent",
					border: "none",
					margin: 0,
					padding: 0
				}),
			// Store the size in case width/height are defined in % - Fixes #5245
			size = {
				width: element.width(),
				height: element.height()
			},
			active = document.activeElement;

		element.wrap( wrapper );

		// Fixes #7595 - Elements lose focus when wrapped.
		if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
			$( active ).focus();
		}

		wrapper = element.parent(); //Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element

		// transfer positioning properties to the wrapper
		if ( element.css( "position" ) === "static" ) {
			wrapper.css({ position: "relative" });
			element.css({ position: "relative" });
		} else {
			$.extend( props, {
				position: element.css( "position" ),
				zIndex: element.css( "z-index" )
			});
			$.each([ "top", "left", "bottom", "right" ], function(i, pos) {
				props[ pos ] = element.css( pos );
				if ( isNaN( parseInt( props[ pos ], 10 ) ) ) {
					props[ pos ] = "auto";
				}
			});
			element.css({
				position: "relative",
				top: 0,
				left: 0,
				right: "auto",
				bottom: "auto"
			});
		}
		element.css(size);

		return wrapper.css( props ).show();
	},

	removeWrapper: function( element ) {
		var active = document.activeElement;

		if ( element.parent().is( ".ui-effects-wrapper" ) ) {
			element.parent().replaceWith( element );

			// Fixes #7595 - Elements lose focus when wrapped.
			if ( element[ 0 ] === active || $.contains( element[ 0 ], active ) ) {
				$( active ).focus();
			}
		}


		return element;
	},

	setTransition: function( element, list, factor, value ) {
		value = value || {};
		$.each( list, function(i, x){
			var unit = element.cssUnit( x );
			if ( unit[ 0 ] > 0 ) value[ x ] = unit[ 0 ] * factor + unit[ 1 ];
		});
		return value;
	},

	dirNormFlipHash: {
		topleft    : 'bottomRight',
		top        : 'bottom',
		topright   : 'bottomLeft',
		centerleft : 'centerRight',
		center     : 'center',
		centerright: 'centerLeft',
		bottomleft : 'topRight',
		bottom     : 'top',
		bottomright: 'topLeft',

		upperleft  : 'lowerRight',
		up         : 'down',
		upperright : 'lowerLeft',
		left       : 'right',
		middleleft : 'middleRight',
		middle     : 'middle',
		middleright: 'middleLeft',
		right      : 'left',
		lowerleft  : 'upperRight',
		down       : 'up',
		lowerright : 'upperLeft'
	},

	cssUnitTypeHash: {
		em  : 'l',  // length
		ex  : 'l',
		ch  : 'l',
		rem : 'l',
		vw  : 'l',
		vh  : 'l',
		vmin: 'l',
		cm  : 'l',
		mm  : 'l',
		'in': 'l',
		px  : 'l',
		pt  : 'l',
		pc  : 'l',
		'%' : 'l',
		deg : 'a',  // angle
		grad: 'a',
		rad : 'a',
		turn: 'a',
		s   : 't',  // time
		ms  : 't',
		Hz  : 'f',  // frequency
		kHz : 'f',
		dpi : 'r',  // resolution
		dpcm: 'r',
		dppx: 'r'
	}

});

// return an effect options object for the given parameters:
function _normalizeArguments( effect, options, speed, callback ) {

	// short path for passing an effect options object:
	if ( $.isPlainObject( effect ) ) {
		return effect;
	}

	// convert to an object
	effect = { effect: effect };

	// catch (effect)
	if ( options === undefined ) {
		options = {};
	}

	// catch (effect, callback)
	if ( $.isFunction( options ) ) {
		callback = options;
		speed = null;
		options = {};
	}

	// catch (effect, speed, ?)
	if ( $.type( options ) === "number" || $.fx.speeds[ options ]) {
		callback = speed;
		speed = options;
		options = {};
	}

	// catch (effect, options, callback)
	if ( $.isFunction( speed ) ) {
		callback = speed;
		speed = null;
	}

	// add options to effect
	if ( options ) {
		$.extend( effect, options );
	}

	speed = speed || options.duration;
	effect.duration = $.fx.off ? 0 : typeof speed === "number"
		? speed : speed in $.fx.speeds ? $.fx.speeds[ speed ] : $.fx.speeds._default;

	effect.complete = callback || options.complete;

	return effect;
}

function standardSpeed( speed ) {
	// valid standard speeds
	if ( !speed || typeof speed === "number" || $.fx.speeds[ speed ] ) {
		return true;
	}

	// invalid strings - treat as "normal" speed
	if ( typeof speed === "string" && !$.effects.effect[ speed ] ) {
		// TODO: remove in 2.0 (#7115)
		if ( backCompat && $.effects[ speed ] ) {
			return false;
		}
		return true;
	}

	return false;
}

$.fn.extend({
	effect: function( effect, options, speed, callback ) {
		var args = _normalizeArguments.apply( this, arguments ),
			mode = args.mode,
			queue = args.queue,
			effectMethod = $.effects.effect[ args.effect ],

			// DEPRECATED: remove in 2.0 (#7115)
			oldEffectMethod = !effectMethod && backCompat && $.effects[ args.effect ];

		if ( $.fx.off || !( effectMethod || oldEffectMethod ) ) {
			// delegate to the original method (e.g., .show()) if possible
			if ( mode ) {
				return this[ mode ]( args.duration, args.complete );
			} else {
				return this.each( function() {
					if ( args.complete ) {
						args.complete.call( this );
					}
				});
			}
		}

		function run( next ) {
			var elem = $( this ),
				complete = args.complete,
				mode = args.mode;

			function done() {
				if ( $.isFunction( complete ) ) {
					complete.call( elem[0] );
				}
				if ( $.isFunction( next ) ) {
					next();
				}
			}

			// if the element is hiddden and mode is hide,
			// or element is visible and mode is show
			if ( elem.is( ":hidden" ) ? mode === "hide" : mode === "show" ) {
				done();
			} else {
				effectMethod.call( elem[0], args, done );
			}
		}

		// TODO: remove this check in 2.0, effectMethod will always be true
		if ( effectMethod ) {
			return queue === false ? this.each( run ) : this.queue( queue || "fx", run );
		} else {
			// DEPRECATED: remove in 2.0 (#7115)
			return oldEffectMethod.call(this, {
				options: args,
				duration: args.duration,
				callback: args.complete,
				mode: args.mode
			});
		}
	},

	_show: $.fn.show,
	show: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._show.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "show";
			return this.effect.call( this, args );
		}
	},

	_hide: $.fn.hide,
	hide: function( speed ) {
		if ( standardSpeed( speed ) ) {
			return this._hide.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "hide";
			return this.effect.call( this, args );
		}
	},

	// jQuery core overloads toggle and creates _toggle
	__toggle: $.fn.toggle,
	toggle: function( speed ) {
		if ( standardSpeed( speed ) || typeof speed === "boolean" || $.isFunction( speed ) ) {
			return this.__toggle.apply( this, arguments );
		} else {
			var args = _normalizeArguments.apply( this, arguments );
			args.mode = "toggle";
			return this.effect.call( this, args );
		}
	},

	// helper functions
	cssUnit: function(key) {
		var style = this.css( key ),
			val = [];

		$.each( [ "em", "px", "%", "pt" ], function( i, unit ) {
			if ( style.indexOf( unit ) > 0 )
				val = [ parseFloat( style ), unit ];
		});
		return val;
	},

	// conversion of units
	cssUnitConvert: function(n, opts) {
		var $elem = $(this);
		
		var sUnit   = opts['startUnit'];
		var eUnit   = opts['endUnit'];
		var isHoriz = (opts['isHoriz'] || !opts['isVert']);
		
		// sanity checks
		var parts = rfxnum.exec(n);
		if (!parts)   return null;
		if (parts[2]) sUnit = parts[2];  // unit can be built into n
		if (!sUnit)   eUnit = 'px';
		n = parseFloat(parts[1]);
		
		var dpi = 96;  // per CSS3-Values/Units, DPI has a fixed value of 96

		// check for unit type uniformity
		if ($.effects.cssUnitTypeHash[sUnit] !== $.effects.cssUnitTypeHash[eUnit]) return null;

		// certain variables that might cost CPU
		var fontSize, rootFontSize, vW, vH, elemWH;
		if ($.effects.cssUnitTypeHash[sUnit] == 'l') {
			var unitChk = ':' + sUnit + ':' + eUnit;
			if (/:(e[mx]|ch)/.test(unitChk)) fontSize     = parseInt($elem.css('fontSize'));
			if (/:rem/.test(unitChk))        rootFontSize = parseInt($(this.ownerDocument.firstChild).css('fontSize'));
			if (/:v(w|min)/.test(unitChk))   vW     = $(window).width();
			if (/:v(h|min)/.test(unitChk))   vH     = $(window).height();
			if (/:\%/.test(unitChk))         elemWH = (isHoriz ? $elem.outerWidth() : $elem.outerHeight());
		}

		// convert n to px/turn/s/Hz/dpi
		switch (sUnit) {
			case 'px'  :                              break;
			case 'pt'  : n *= 72/dpi;                 break;
			case 'pc'  : n *= 72/dpi*12;              break;
			case 'in'  : n *= dpi;                    break;
			case 'cm'  : n *= dpi/2.54;               break;
			case 'mm'  : n *= dpi/25.4;               break;
			case 'em'  : n *= fontSize;               break;
			case 'ex'  : n *= fontSize / 2;           break;
			case 'ch'  : n *= fontSize / 2;           break;  // for now, need a better way to express this...
			case 'rem' : n *= rootFontSize;           break;
			case 'vw'  : n *= vW / 100;               break;
			case 'vh'  : n *= vH / 100;               break;
			case 'vmin': n *= Math.min(vW, vH) / 100; break;
			case '%'   : n *= elemWH / 100;           break;

			case 'turn':                              break;
			case 'deg' : n *= 1/360;                  break;
			case 'grad': n *= 1/400;                  break;
			case 'rad' : n *= 1/(2*Math.PI);          break;

			case 's'   :                              break;
			case 'ms'  : n *= 1/1000;                 break;

			case 'Hz'  :                              break;
			case 'kHz' : n *= 1000;                   break;

			case 'dpi' :                              break;
			case 'dpcm': n *= 2.54;                   break;
			case 'dppx':                              break;

			default    :                              break;  // assume px
		}

		// convert n to eUnit
		switch (eUnit) {
			case 'px'  :                              break;
			case 'pt'  : n /= 72/dpi;                 break;
			case 'pc'  : n /= 72/dpi*12;              break;
			case 'in'  : n /= dpi;                    break;
			case 'cm'  : n /= dpi/2.54;               break;
			case 'mm'  : n /= dpi/25.4;               break;
			case 'em'  : n /= fontSize;               break;
			case 'ex'  : n /= fontSize / 2;           break;
			case 'ch'  : n /= fontSize / 2;           break;  // for now, need a better way to express this...
			case 'rem' : n /= rootFontSize;           break;
			case 'vw'  : n /= vW / 100;               break;
			case 'vh'  : n /= vH / 100;               break;
			case 'vmin': n /= Math.min(vW, vH) / 100; break;
			case '%'   : n /= elemWH / 100;           break;

			case 'turn':                              break;
			case 'deg' : n /= 1/360;                  break;
			case 'grad': n /= 1/400;                  break;
			case 'rad' : n /= 1/(2*Math.PI);          break;

			case 's'   :                              break;
			case 'ms'  : n /= 1/1000;                 break;

			case 'Hz'  :                              break;
			case 'kHz' : n /= 1000;                   break;

			case 'dpi' :                              break;
			case 'dpcm': n /= 2.54;                   break;
			case 'dppx':                              break;

			default    :                              break;  // assume px
		}

		return n;
	},

	directionNormalize: function(dir, opts) {
		if (typeof dir !== 'string') return null;
		var newDir = dir;

		// top/bottom/up/down conversion
		if ( opts['useTopBottom'] || !opts['useUpDown'] )
			newDir = newDir.replace(/up|upper/i, 'top').replace(/lower|down/i, 'bottom');
		if ( !opts['useTopBottom'] || opts['useUpDown'] )
			newDir = newDir.replace(/top(\w+)/i,    "upper$1").replace(/top/i,    'up')
								.replace(/bottom(\w+)/i, "lower$1").replace(/bottom/i, 'down');

		// center/middle conversion
		if ( opts['useCenter'] || !opts['useMiddle'] )
			newDir = newDir.replace(/middle/i, 'center');
		if ( !opts['useCenter'] || opts['useMiddle'] )
			newDir = newDir.replace(/center/i, 'middle');

		// flip direction
		if ( opts['flip'] ) newDir = $.effects.dirNormFlipHash[newDir.toLowerCase()] || newDir;

		// upper/lower
		if ( opts['upper'] )      newDir = newDir.toUpperCase();
		if ( opts['lower'] )      newDir = newDir.toLowerCase();
		if ( opts['capitalize'] ) newDir = newDir.charAt(0).toUpperCase() + newDir.slice(1);

		return newDir;
	}
});

/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

var baseEasings = {};

$.each( [ "Quad", "Cubic", "Quart", "Quint", "Expo" ], function( i, name ) {
	baseEasings[ name ] = function( p ) {
		return Math.pow( p, i + 2 );
	};
});

$.extend( baseEasings, {
	Sine: function ( p ) {
		return 1 - Math.cos( p * Math.PI / 2 );
	},
	Circ: function ( p ) {
		return 1 - Math.sqrt( 1 - p * p );
	},
	Elastic: function( p ) {
		return p === 0 || p === 1 ? p :
			-Math.pow( 2, 8 * (p - 1) ) * Math.sin( ( (p - 1) * 80 - 7.5 ) * Math.PI / 15 );
	},
	Back: function( p ) {
		return p * p * ( 3 * p - 2 );
	},
	Bounce: function ( p ) {
		var pow2,
			bounce = 4;

		while ( p < ( ( pow2 = Math.pow( 2, --bounce ) ) - 1 ) / 11 ) {}
		return 1 / Math.pow( 4, 3 - bounce ) - 7.5625 * Math.pow( ( pow2 * 3 - 2 ) / 22 - p, 2 );
	}
});

$.each( baseEasings, function( name, easeIn ) {
	$.easing[ "easeIn" + name ] = easeIn;
	$.easing[ "easeOut" + name ] = function( p ) {
		return 1 - easeIn( 1 - p );
	};
	$.easing[ "easeInOut" + name ] = function( p ) {
		return p < .5 ?
			easeIn( p * 2 ) / 2 :
			easeIn( p * -2 + 2 ) / -2 + 1;
	};
});

})(jQuery);
