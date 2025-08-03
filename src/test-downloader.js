var __classPrivateFieldGet =
  (this && this.__classPrivateFieldGet) ||
  function (receiver, state, kind, f) {
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a getter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot read private member from an object whose class did not declare it"
      );
    return kind === "m"
      ? f
      : kind === "a"
      ? f.call(receiver)
      : f
      ? f.value
      : state.get(receiver);
  };
var __classPrivateFieldSet =
  (this && this.__classPrivateFieldSet) ||
  function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a setter");
    if (
      typeof state === "function"
        ? receiver !== state || !f
        : !state.has(receiver)
    )
      throw new TypeError(
        "Cannot write private member to an object whose class did not declare it"
      );
    return (
      kind === "a"
        ? f.call(receiver, value)
        : f
        ? (f.value = value)
        : state.set(receiver, value),
      value
    );
  };
var _DlItem_parents_parent;
var DlItem = /** @class */ (function () {
  function DlItem(args) {
    if (args === void 0) {
      args = { progress: 0 };
    }
    this.progress = 0;
    this.speed = "";
    this.size = "";
    this.items = [];
    this.label = "";
    this.id = "";
    for (var _i = 0, _a = Object.keys(args); _i < _a.length; _i++) {
      var key = _a[_i];
      if (Object.hasOwn(this, key)) {
        this[key] = args[key];
      }
    }
  }
  Object.defineProperty(DlItem.prototype, "done", {
    get: function () {
      return this.progress >= 100;
    },
    enumerable: false,
    configurable: true,
  });
  DlItem.prototype.getProgress = function () {
    return this.items.length > 0
      ? Math.floor(
          (this.items.reduce(function (a, i) {
            return a + +i.getProgress();
          }, 0) /
            (this.items.length * 100)) *
            100
        )
      : this.progress;
  };
  DlItem.prototype.setProgress = function (progress) {
    this.progress = Math.min(progress, 100);
  };
  DlItem.prototype.get = function (id) {
    return this.id === id
      ? this
      : this.items.find(function (i) {
          return i.get(id);
        });
  };
  return DlItem;
})();
var _items = [
  new DlItem({
    id: "file",
    label: "File",
    items: [
      new DlItem({
        id: "audio",
        label: "Audio",
      }),
      new DlItem({
        id: "video",
        label: "Video",
      }),
    ],
  }),
];
function recProgressUpdate(progress, items, path, curItem, start) {
  if (start === void 0) {
    start = 0;
  }
  var idx = path[start];
  var next = idx === undefined ? undefined : items[idx];
  if (next) {
    recProgressUpdate(progress, next.items, path, next, start + 1);
    next.setProgress(next.getProgress());
  } else if (curItem) {
    curItem.setProgress(progress);
  }
}
function genQueue(queue) {
  if (!queue.length) {
    return [];
  }
  function inner(items, path) {
    for (var i = 0; i < items.length; i++) {
      if (items[i] && !items[i].done) {
        path.push(i);
        inner(items[i].items, path);
        break;
      }
    }
    return path;
  }
  return inner(queue, []);
}
recProgressUpdate(100, _items, [0, 0], undefined, 0);
recProgressUpdate(50, _items, [0, 1], undefined, 0);
recProgressUpdate(100, _items, [0, 2], undefined, 0);
recProgressUpdate(100, _items, [1, 0], undefined, 0);
console.dir(_items, { depth: null, colors: true });
console.log(genQueue(_items));
var DlItem_parents = /** @class */ (function () {
  function DlItem_parents(args) {
    if (args === void 0) {
      args = { progress: 0 };
    }
    this.progress = 0;
    this.speed = "";
    this.size = "";
    this.items = [];
    this.label = "";
    this.id = "";
    _DlItem_parents_parent.set(this, void 0);
    for (var _i = 0, _a = Object.keys(args); _i < _a.length; _i++) {
      var key = _a[_i];
      if (Object.hasOwn(this, key)) {
        this[key] = args[key];
      }
    }
  }
  Object.defineProperty(DlItem_parents.prototype, "parent", {
    get: function () {
      return __classPrivateFieldGet(this, _DlItem_parents_parent, "f");
    },
    enumerable: false,
    configurable: true,
  });
  DlItem_parents.prototype.getProgress = function () {
    return this.items.length > 0
      ? Math.floor(
          (this.items.reduce(function (a, i) {
            return a + +i.getProgress();
          }, 0) /
            (this.items.length * 100)) *
            100
        )
      : this.progress;
  };
  DlItem_parents.prototype.setProgress = function (progress) {
    this.progress = Math.min(progress, 100);
  };
  DlItem_parents.prototype.get = function (id) {
    return this.id === id
      ? this
      : this.items.find(function (i) {
          return i.get(id);
        });
  };
  DlItem_parents.prototype.add = function (item) {
    __classPrivateFieldSet(item, _DlItem_parents_parent, this, "f");
    this.items.push(item);
  };
  return DlItem_parents;
})();
_DlItem_parents_parent = new WeakMap();
var _items_parents_file = new DlItem_parents({
  id: "file",
  label: "File",
});
var _items_parents_audio = new DlItem_parents({
  id: "audio",
  label: "Audio",
});
var _items_parents_video = new DlItem_parents({
  id: "video",
  label: "Video",
});
_items_parents_file.add(_items_parents_audio);
_items_parents_file.add(_items_parents_video);
var _items_parents = [_items_parents_file];
_items_parents_audio.setProgress(20);
var _item_parent = _items_parents_audio.parent;
while (_item_parent) {
  _item_parent.setProgress(_item_parent.getProgress());
  _item_parent = _item_parent.parent;
}
