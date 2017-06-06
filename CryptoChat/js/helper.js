const hide = function(id) {
    const obj = $(`#${id}`);
    obj.addClass("display-none");
    obj.removeClass("flex");
};
const show = function(id) {
    const obj = $(`#${id}`);
    obj.removeClass("display-none");
    obj.addClass("flex");
};
const replaceClass = function(id, from, to) {
    const obj = $(`#${id}`);
    obj.removeClass(from);
    obj.addClass(to);
};
const showTooltipIf = function(id, target, func, trimmed) {
    const obj = $(`#${id}`);
    const t = $(`#${target}`);
    if (func(obj, trimmed)) {
        t.tooltip("show");
        setTimeout(function() {
                t.tooltip("hide");
            },
            1000);
    } else {
        t.tooltip("hide");
    }
};
const removeTooltip = function(obj) {
    obj.tooltip("dispose");
};
const removePopover = function(obj) {
    obj.popover("dispose");
};
const inputfieldToFailedStateIf = function(id, target, func, trimmed) {
    if (!func($(`#${id}`), trimmed)) {
        replaceClass(target, "has-danger", "has-success");
        replaceClass(id, "form-control-danger", "form-control-success");
    } else {
        replaceClass(target, "has-success", "has-danger");
        replaceClass(id, "form-control-success", "form-control-danger");
    }
};
const isValueEmpty = function(obj, trimmed = true) {
    if (trimmed) {
        return obj.val().trim() === "";
    }
    return obj.val() === "";
};
const nextColor = function(color) {
    return colors.indexOf(color) + 1 === colors.length ? colors[0] : colors[colors.indexOf(color) + 1];
};