$.scrollify({
  section: ".section",
  updateHash: false,
  setHeights: false
});

$("a").on("click", function (e) {
  e.preventDefault();
  $("body").addClass("is-active");
  $('#content').load(this.href);
  $.scrollify.disable();
});


$("button").on("click", function (e) {
  e.preventDefault();
  $("body").removeClass("is-active");
  $.scrollify.enable();
});
