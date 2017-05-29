const hide = function (id) {
    $(`#${id}`).fadeOut('fast');
};
const show = function (id) {
    $(`#${id}`).fadeIn('fast');
};
const replaceClass = function (id, from, to) {
    const obj = $(`#${id}`);
    obj.removeClass(from);
    obj.addClass(to);
}