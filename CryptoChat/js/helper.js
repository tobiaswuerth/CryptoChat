const hide = function(id) {
    const obj = $(`#${id}`);
    if (obj.is(":visible")) {
        obj.fadeOut("fast");
    }
};
const show = function(id) {
    const obj = $(`#${id}`);
    if (!obj.is(":visible")) {
        obj.fadeIn("fast");
    }
};
const replaceClass = function(id, from, to) {
    const obj = $(`#${id}`);
    obj.removeClass(from);
    obj.addClass(to);
};
let tooltipTimeout = null;
const showTooltipIf = function(id, target, func) {
    const obj = $(`#${id}`);
    const t = $(`#${target}`);
    if (func(obj)) {
        clearTimeout(tooltipTimeout);
        t.tooltip("show");
        tooltipTimeout = setTimeout(function() {
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
const inputfieldToFailedStateIf = function(id, target, func) {
    if (!func($(`#${id}`))) {
        replaceClass(target, "has-danger", "has-success");
        replaceClass(id, "form-control-danger", "form-control-success");
    } else {
        replaceClass(target, "has-success", "has-danger");
        replaceClass(id, "form-control-success", "form-control-danger");
    }
};
const isValueEmpty = function(obj) {
    return obj.val() === "";
};