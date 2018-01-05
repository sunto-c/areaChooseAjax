var $ = require('jquery');

var childUrl;
var loadAllAreaUrl;

function AreaChooseAjax(options) {

  childUrl = options.childUrl || '/view/region/getChild';
  if (options.chinaType == 1) {
    loadAllAreaUrl = options.loadAllAreaUrl || '/view/region/loadAllArea?chinaType=1&id=';
  } else {
    loadAllAreaUrl = options.loadAllAreaUrl || '/view/region/loadAllArea?id=';
  }

  if ((typeof options.pid !== 'undefined') && (typeof options.lv !== 'undefined')) {
    throw '不允许同时定义pid跟lv';
  }
  if ((typeof options.pid === 'undefined') && (typeof options.lv === 'undefined')) {
    options.lv = 2;
  }
  //设定默认层级
  // options.limitLevel = options.limitLevel || 6;

  this.opt = $.extend({}, options || {});
  this.el = this.opt.el;

  this.selectTxt = ($.t && $.t('help.pleaseSelect')) || '请选择';

  this.bind();
  this.init(this.opt.id);
}

AreaChooseAjax.prototype.init = function(id) {
  var self = this;
  this.domArr = [];
  // 初始值
  if (id) {
    $.ajax({
      url: loadAllAreaUrl + id,
      data: {
        limitLevel: self.opt.limitLevel,
      },
      type: 'get',
    }).success(function(result) {
      if (!result.success) {
        if (layer) {
          layer.msg(result.msg);
        } else {
          alert(result.msg);
        }
        return;
      }
      $.isFunction(self.opt.init) && self.opt.init.call(self);
      if (result.data && result.data.length) {
        $.each(result.data, function(key, item) {
          if (!item.length) return;
          var node = ['<select name="" id="" data-level="' + item[0].level + '"><option value="">' + self.selectTxt + '</option>'];
          $.each(item, function(k, val) {
            if (val.isSelect) {
              node.push('<option selected value="' + val.id + '">' + val.name + '</option>');
            } else {
              node.push('<option value="' + val.id + '">' + val.name + '</option>');
            }
          });
          node.push('</select>');
          $(self.el).append(node.join(' '));
        });
      }
      $.isFunction(self.opt.inited) && self.opt.inited.call(self);
    });
  } else {
    self.getChild({
      lv: self.opt.lv,
      pId: self.opt.pid,
      limitLevel: self.opt.limitLevel,
    });
  }
};
AreaChooseAjax.prototype.getChild = function(params) {
  var child;
  var self = this;
  $.ajax({
    url: childUrl,
    data: params,
    type: 'get',
  }).success(function(result) {
    if (!result.success) {
      if (layer) {
        layer.msg(result.msg);
      } else {
        alert(result.msg);
      }
      return;
    }
    child = result.data;

    if (child && child.length) {
      var node = ['<select name="" id="" data-level="' + child[0].level + '"><option value="">' + self.selectTxt + '</option>'];
      $.each(child, function(key, item) {
        node.push('<option value="' + item.id + '">' + item.name + '</option>');
      });
      node.push('</select>');
      $(self.el).append(node.join(' '));
    } else {
      $.isFunction(self.opt.nodata) && self.opt.nodata.call(null, params.pId);
    }
  });
};

AreaChooseAjax.prototype.onChange = function(e) {
  var
      $target = $(e.target),
      id = Number($target.val()),
      self = this;
  $(e.target).nextAll('select').remove();
  if (!id) return;
  this.getChild({
    pId: id,
    limitLevel: self.opt.limitLevel,
  });
};

AreaChooseAjax.prototype.bind = function(id) {
  // TODO: 只移除this.onChange
  $('body').off('change', this.el + ' select');
  $('body').on('change', this.el + ' select', this.onChange.bind(this));
};

/**解决ie8及以下 "bind()" 方法不兼容问题**/
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    }
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function() {
        },
        fBound = function() {
          return fToBind.apply(this instanceof fNOP && oThis
              ? this
              : oThis,
              aArgs.concat(Array.prototype.slice.call(arguments)));
        };
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  };
}
/**解决ie8及以下 "bind()" 方法不兼容问题**/

module.exports = AreaChooseAjax;
