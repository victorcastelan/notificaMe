// notificaMe v1.0 by Daniel Raftery
// http://thrivingkings.com/notificaMe
//
// http://twitter.com/ThrivingKings
/*
 * Cambios VMC:
 * - Al cerrar, se aplica remove() adicionalmente a fadeOut()
 * - Se agregó callback onClose a los parámetros (options)
 * - Se agregó position como parámetro
 * - Se agregó addClass y style como parámetro
 */

(function( $ )
	{
	
	// Using it without an object
	$.notificaMe = function(note, options, callback) {return $.fn.notificaMe(note, options, callback);};
	
	$.fn.notificaMe = function(note, options, callback) 
		{
		// Default settings
		var settings =
			{
			'speed'			:	'fast',	 // animations: fast, slow, or integer
			'duplicates'	:	true,  // true or false
			'autoclose'		:	2500,  // integer or false
			'onClose'		:   function() {},
			'position'		:	'bottom-left',  // top-left, top-right, bottom-left, or bottom-right
			'addClass'		:   '', //Clase que agregaremos al notificaMe
			'style'			:   ''
			};

		
		// Passing in the object instead of specifying a note
		if(!note)
			{note = this.html();}
		
		if(options)
			{$.extend(settings, options);}
		//Complementamos classes
		if (settings.addClass) settings.addClass = 'notificaMe-'+settings.addClass;
		
		// Variables
		var display = true;
		var duplicate = 'no';
		
		// Somewhat of a unique ID
		var uniqID = Math.floor(Math.random()*99999);
		
		// Handling duplicate notes and IDs
		$('.notificaMe-note').each(function()
			{
			if($(this).html() == note && $(this).is(':visible'))
				{ 
				duplicate = 'yes';
				if(!settings['duplicates'])
					{display = false;}
				}
			if($(this).attr('id')==uniqID)
				{uniqID = Math.floor(Math.random()*9999999);}
			});
		
		// Make sure the notificaMe queue exists
		if(!$('body').find('.notificaMe-queue.'+settings.position).is('*'))
			{$('body').append('<div class="notificaMe-queue ' + settings.position + '"></div>');}
		
		// Can it be displayed?
		if(display) {
			// Building and inserting notificaMe note
			$('.notificaMe-queue.'+settings.position).prepend('<div class="notificaMe border-' + settings.position + ' ' + settings.addClass + '" id="' + uniqID + '" style="'+settings.style+'"></div>');
			$('#' + uniqID).append('<img src="img/close.png" class="notificaMe-close" rel="' + uniqID + '" title="Close" />');
			if (settings.position != 'top-center') $('#' + uniqID).append('<img src="img/minimize.png" class="notificaMe-minimize" rel="' + uniqID + '" title="Minimize" />');
			$('#' + uniqID).append('<div class="notificaMe-note" rel="' + uniqID + '">' + note + '</div>');
			
			// Smoother animation
			var height = $('#' + uniqID).height();
			$('#' + uniqID).css('min-height', height);
			
			$('#' + uniqID).slideDown(settings['speed']);
			display = true;
			}
		
		// Callback data
		var response = 
			{
			'id'		:	uniqID,
			'duplicate'	:	duplicate,
			'displayed'	: 	display,
			'position'	:	settings.position
			}

		$('#'+uniqID).data('notificaMe',{
			'response' : $.extend({}, response),
			'settings' : $.extend({}, settings)
		});
		var notificaMeData = $('#'+uniqID).data('notificaMe');
			
		// Listeners
		$('.notificaMe').ready(function() {
			// If 'autoclose' is enabled, set a timer to close the notificaMe
			if(settings['autoclose']) { 
				notificaMeData.settings.onClose(notificaMeData.response);
				$('#' + uniqID).delay(settings['autoclose']).fadeOut(settings['speed'],function(){
					
					$('#'+uniqID).removeData('notificaMe');
					$('#'+uniqID).find('.notificaMe-close').unbind();
					$('#'+uniqID).find('.notificaMe-minimize').die('click');
					$('#'+uniqID).find('.notificaMe-maximize').die('click');
					$('#'+uniqID).find('.notificaMe-note').removeData();
					
					//If notificaMe-queue is empty, delete it
					if($(this).closest('.notificaMe-queue').children().length <= 1) {
						$(this).closest('.notificaMe-queue').remove();
					} else {
						$(this).remove();
					}
				});
			}
		});
		// Closing a notificaMe
		$('#'+uniqID).find('.notificaMe-close').one('click',function() {
			var thisRel = $('#' + $(this).attr('rel'));
			
			notificaMeData.settings.onClose(notificaMeData.response);
			thisRel.dequeue().fadeOut(settings['speed'],function(){
				thisRel.find('.notificaMe-note').removeData();
				thisRel.find('.notificaMe-minimize').die('click');
				thisRel.find('.notificaMe-maximize').die('click');
				$(this).removeData('notificaMe');
				//If notificaMe-queue is empty, delete it
				if($(this).closest('.notificaMe-queue').children().length <= 1) {
					$(this).closest('.notificaMe-queue').remove();
				} else {
					$(this).remove();
				}
			}); 
		});
		// Minimizing a notificaMe
		$('#'+uniqID).find('.notificaMe-minimize').live('click',function() {
			var thisRel = $('#' + $(this).attr('rel'));
			var papa = thisRel.find('.notificaMe-note');
			var ancho = papa.width();
			var alto = papa.height();
			thisRel.data('medidas',{'ancho':ancho,'alto':alto});
			papa.closest('.notificaMe-video').css('min-height','');
			papa.animate({'width':'32px','height':'0px'});
			thisRel.find('.notificaMe-minimize').attr('src','img/maximize.png')
				.addClass('notificaMe-maximize').removeClass('notificaMe-minimize');
		});
		// Restaurate a notificaMe
		$('#'+uniqID).find('.notificaMe-maximize').live('click',function() {
			var thisRel = $('#' + $(this).attr('rel'));
			var papa = thisRel.find('.notificaMe-note');
			var ancho = thisRel.data('medidas').ancho;
			var alto =  thisRel.data('medidas').alto;
			papa.closest('.notificaMe-video').css('min-height','');
			papa.animate({"width":ancho+"px","height":alto+"px"});
			thisRel.find('.notificaMe-maximize').attr('src','img/minimize.png')
				.addClass('notificaMe-minimize').removeClass('notificaMe-maximize');
		});
		

		// Callback function?
		if(callback)
			{callback(response);}
		else
			{return(response);}
		
		}
	})( jQuery );
	
