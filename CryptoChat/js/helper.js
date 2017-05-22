const hide = function(id) {
    $("#" + id).removeClass("show");
    $("#" + id).addClass("hide");
}
const show = function (id) {
    $("#" + id).removeClass("hide");
    $("#" + id).addClass("show");
}