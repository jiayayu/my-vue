function SelfVue(options) {
    var self = this;
    this.data = options.data;
    this.methods = options.methods;
    Object.keys(this.data).forEach(function(key) {
        self.proxyKeys(key); // 绑定代理
    });

    // 初始化observer,为vm.data添加观察者模式
    observe(this.data);

    new Compile(options.el, this);

    options.mounted.call(this); // 所有事情处理完之后执行mounted函数
    return this;
}

SelfVue.prototype = {
    proxyKeys: function(key) { // 将data中的key 直接挂在selfVue实例上
        var self = this;
        Object.defineProperty(self, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                return self.data[key];
            },
            set: function(newValue) {
                self.data[key] = newValue;
            }
        })
    }
}