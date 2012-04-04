/*
 * jQuery UI Effects Slide @VERSION
 *
 * Copyright 2012, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Effects/Slide
 *
 * Depends:
 *	jquery.effects.core.js
 */
(function( $, undefined ) {

$.effects.effect.slide = function( o, done ) {

	// Create element
	var el = $( this ),
		props = [ "position", "top", "bottom", "left", "right", "width", "height", "clip", "overflow" ],
		mode = $.effects.setMode( el, o.mode || "show" ),
		show = mode === "show",
		direction = $.fn.directionNormalize(o.direction || "left", { useUpDown: 1, lower: 1 } ),
		ref            = (direction == "up" || direction == "down") ? "top" : "left",
		positiveMotion = (direction == "up" || direction == "left") == show,  // bitflipping
		// ref only uses top/left, clip uses all directions
		clipRef    = 'clip' + $.fn.directionNormalize(direction, {          useTopBottom: 1, capitalize: 1 } ),
		clipOppRef = 'clip' + $.fn.directionNormalize(direction, { flip: 1, useTopBottom: 1, capitalize: 1 } ),
		distance,
		animation = {},
		size;

	// Adjust
	$.effects.save( el, props );
	el.show();
	distance = el.cssUnitConvert(o.distance, { isVert: (ref == 'top') }) || el[ ref === "top" ? "outerHeight" : "outerWidth" ]({
		margin: true
	});
	
	// Now wrapper-less...
	el.css('overflow', 'hidden');
	// However, all clipped elements must have position=absolute
	if (el.css('position') !== 'absolute') {
		var p = el.position();
		el.css({
			position: 'absolute',
			top     : p.top,
			left    : p.left
		})
	}

	if ( show ) {
		var current = parseFloat(el.css(ref));
		if ( isNaN(current) ) current = 0;
		el.css( ref,        isNaN(distance) ? (
			positiveMotion ? '-' + distance : distance  // not exactly correct, but we can't do math on a NaN
		) : (
			current + (positiveMotion ? -1 : 1) * distance
		));
		
		// clip left-right or top-bottom at same pixel point to hide element
		el.css( clipRef,    positiveMotion ? distance : 0 );
		el.css( clipOppRef, positiveMotion ? distance : 0 );
	}
	
	// Animation
	animation[ ref     ] = ( positiveMotion ? "+=" : "-=" ) + distance;
	animation[ clipRef ] = ( positiveMotion ? "-=" : "+=" ) + distance;  // opposite direction of ref

	// Animate
	el.animate( animation, {
		queue: false,
		duration: o.duration,
		easing: o.easing,
		complete: function() {
			if ( mode === "hide" ) {
				el.hide();
			}
			$.effects.restore( el, props );
			done();
		}
	});

};

})(jQuery);
