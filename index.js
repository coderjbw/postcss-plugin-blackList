import postcss from "postcss";

// 默认参数
const defaultOpts = {
  rootValue: 100,
  unitPrecision: 5,
  selectorBlackList: [],
  propWhiteList: [],
  propBlackList: [],
  ignoreIdentifier: false,
  replace: true,
  mediaQuery: false,
  minPixelValue: 0,
};
// 判断是否是对象
const isObject = (o) => typeof o === "object" && o !== null;

function toFixed(number, precision) {
  const multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
}

const createPxReplace =
  (rootValue, identifier, unitPrecision, minPixelValue) => (m, $1, $2) => {
    //   console.log(m);
    //   console.log($1);
    //   console.log($2);
    if (!$1) return m;
    if (identifier && m.indexOf(identifier) === 0)
      return m.replace(identifier, "");
    const pixels = parseFloat($1);
    if (pixels < minPixelValue) return m;
    // { px: 100, rpx: 50 }
    const baseValue = isObject(rootValue) ? rootValue[$2] : rootValue;
    const fixedVal = toFixed(pixels / baseValue, unitPrecision);

    return `${fixedVal}rem`;
  };

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== "string") return;
  return blacklist.some((regex) => {
    if (typeof regex === "string") {
      return selector.indexOf(regex) !== -1;
    }
    return selector.match(regex);
  });
}

const blacklistedProp = (blacklist, prop) => {
  if (typeof prop !== "string") return false;

  return blacklist.some((regex) => {
    if (typeof regex === "string") return prop.indexOf(regex) !== -1;

    return prop.match(regex);
  });
};

function declarationExists(decls, prop, value) {
  return decls.some((decl) => decl.prop === prop && decl.value === value);
}

module.exports = postcss.plugin("postcss-plugin-blackList", function (options) {
  options = options || {};
  const opts = Object.assign({}, defaults, options);

  let unit = "px";
  if (isObject(opts.rootValue)) {
    unit = Object.keys(opts.rootValue).join("|");
  }

  const regText = `"[^"]+"|'[^']+'|url\\([^\\)]+\\)|(\\d*\\.?\\d+)(${unit})`;
  let pxRegex = new RegExp(regText, "ig");
  let identifier = opts.ignoreIdentifier;
  if (identifier && typeof identifier === "string") {
    identifier = identifier.replace(/\s+/g, "");
    opts.replace = true;
    pxRegex = handleIgnoreIdentifierRegx(identifier, unit);
  } else {
    identifier = false;
  }

  const pxReplace = createPxReplace(
    opts.rootValue,
    identifier,
    opts.unitPrecision,
    opts.minPixelValue
  );

  // Work with options here
  return function (root, result) {
    // Transform CSS AST here
    css.walkDecls((decl, i) => {
        // 每一条css属性
      const _decl = decl;
      // 1st check exclude
      if (
        opts.exclude &&
        css.source.input.file &&
        css.source.input.file.match(opts.exclude) !== null
      )
        return;
      // 2st check 'px'
      if (_decl.value.indexOf("px") === -1) return;
      // 3nd check property black list
      if (blacklistedProp(opts.propBlackList, _decl.prop)) return;
      // 4rd check property white list
      if (
        opts.propWhiteList.length &&
        opts.propWhiteList.indexOf(_decl.prop) === -1
      )
        return;
      // 5th check seletor black list
      if (blacklistedSelector(opts.selectorBlackList, _decl.parent.selector))
        return;

      const value = _decl.value.replace(pxRegex, pxReplace);

      // if rem unit already exists, do not add or replace
      if (declarationExists(_decl.parent, _decl.prop, value)) return;

      if (opts.replace) {
        _decl.value = value;
      } else {
        _decl.parent.insertAfter(
          i,
          _decl.clone({
            value,
          })
        );
      }
    });

    if (opts.mediaQuery) {
      css.walkAtRules("media", (rule) => {
        const _rule = rule;
        if (_rule.params.indexOf("px") === -1) return;
        _rule.params = _rule.params.replace(pxRegex, pxReplace);
      });
    }
  };
});
