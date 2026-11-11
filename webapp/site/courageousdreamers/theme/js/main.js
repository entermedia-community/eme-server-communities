AOS.init({
	duration: 1500,
	once: true,
});
$(".glide").each(function () {
	var gap = $(this).attr("data-glide-gap");
	var glide = new Glide(this, {
		type: "carousel",
		autoplay: 2000,
		hoverpause: false,
		perView: 4,
		gap: gap || 20,
		breakpoints: {
			600: {
				perView: 3,
			},
			400: {
				perView: 1,
			},
		},
	});
	glide.mount();
	glide.on("run", function () {
		$(".glide__slide .slightbox").each(function () {
			$(this).simpleLightbox({
				sourceAttr: "data-href",
			});
		});
	});
});
$(document).on("ready", function () {
	$(".js-fancybox").each(function () {
		$.HSCore.components.HSFancyBox.init($(this));
	});

	$(".js-sticky-block").each(function () {
		new HSStickyBlock($(this)).init();
	});

	$(".js-clipboard").each(function () {
		$.HSCore.components.HSClipboard.init(this);
	});
});
