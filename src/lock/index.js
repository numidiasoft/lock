import Immutable, { Map, Set } from 'immutable';
import { isSmallScreen } from '../utils/media_utils';
import { iconUrl } from '../icon/index';
import * as d from '../dict/index';
import t from '../dict/t';

export function setup(attrs) {
  const { clientID, domain, id } = attrs;

  return Immutable.fromJS({
    clientID: clientID,
    domain: domain,
    id: id
  });
}

export function id(m) {
  return m.get("id");
}

export function clientID(m) {
  return m.get("clientID");
}

export function domain(m) {
  return m.get("domain");
}

export function mode(m) {
  return m.get("mode");
}

export function show(m) {
  return m.get("show", false);
}

export function setShow(m, value) {
  return m.set("show", value);
}

export function setSubmitting(m, value, error) {
  m = m.set("submitting", value);
  m = error && !value ? setGlobalError(m, error) : clearGlobalError(m);
  return m;
}

export function submitting(m) {
  return m.get("submitting", false);
}

export function setGlobalError(m, str) {
  return m.set("globalError", str);
}

export function globalError(m) {
  return m.get("globalError", "");
}

export function clearGlobalError(m) {
  return m.remove("globalError");
}

export function rendering(m) {
  return m.get("render", false);
}

export function gravatar(m) {
  if (ui.gravatar(m)) {
    return m.get("gravatar");
  } else {
    return undefined;
  }
}

function extractUIOptions(id, options) {
  const closable = undefined === options.closable ? !options.container : !!options.closable;
  const dictName = options.modeOptions && options.modeOptions.dictName;
  return new Map({
    containerID: options.container || `auth0-lock-container-${id}`,
    appendContainer: !options.container,
    autoclose: undefined === options.autoclose ? false : closable && options.autoclose,
    icon: options.icon || iconUrl("auth0"),
    closable: closable,
    dict: d.build(dictName, typeof options.dict === "object" ? options.dict : {}),
    focusInput: undefined === options.focusInput ? !(options.container || isSmallScreen()) : !!options.focusInput,
    gravatar: undefined === options.gravatar ? true : !!options.gravatar,
    signInCallback: options.signInCallback, // TODO: this doesn't belong here
    submitButtonColor: typeof options.submitButtonColor === "string" ? options.submitButtonColor : "#ea5323"
  });
}

function setUIOptions(m, options) {
  let currentUIOptions = m.get("ui");
  let newUIOptions = extractUIOptions(id(m), options);;
  if (currentUIOptions) {
    const denied = new Set(["containerID", "appendContainer"]);
    const provided = Set.fromKeys(options).subtract(denied);
    newUIOptions = newUIOptions.filter((v, k) => provided.has(k));
  }
  return m.set("ui", (currentUIOptions || new Map()).merge(newUIOptions));
}

function getUIAttribute(m, attribute) {
  return m.getIn(["ui", attribute]);
}

export const ui = {
  containerID: lock => getUIAttribute(lock, "containerID"),
  appendContainer: lock => getUIAttribute(lock, "appendContainer"),
  autoclose: lock => getUIAttribute(lock, "autoclose"),
  icon: lock => getUIAttribute(lock, "icon"),
  closable: lock => getUIAttribute(lock, "closable"),
  dict: lock => getUIAttribute(lock, "dict"),
  t: (lock, keyPath, params) => t(ui.dict(lock), keyPath, params),
  focusInput: lock => getUIAttribute(lock, "focusInput"),
  gravatar: lock => getUIAttribute(lock, "gravatar"),
  signInCallback: lock => getUIAttribute(lock, "signInCallback"),
  submitButtonColor: lock => getUIAttribute(lock, "submitButtonColor")
};

export function invokeDoneCallback(m, ...args) {
  ui.signInCallback(m).apply(undefined, args);
}

export function render(m, modeName, options) {
  if ((mode(m) != undefined && mode(m) != modeName) || show(m)) {
    return m;
  }

  const { modeOptions } = options;

  m = m.merge(Immutable.fromJS({
    mode: modeName,
    render: true,
    modeOptions: modeOptions
  }));
  m = setUIOptions(m, options);

  if (typeof options.authParams === "object") {
    m = setAuthParams(m, options.authParams);
  }

  return m;
}

export function modeOptions(m) {
  return m.get("modeOptions", false);
}

export function setAuthParams(m, o) {
  return m.set("authParams", o);
}

export function authParams(m) {
  return m.get("authParams", {});
}

export function close(m) {
  return m.set("show", false);
}

export function tabIndex(m, n) {
  return [id(m), n > 9 ? "" : "0", n].join("");
}