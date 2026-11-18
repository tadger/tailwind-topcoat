// One spread per component file. Later spreads win on identical selectors (key order = cascade order).
import button from "./button.js";
import iconButton from "./icon-button.js";
import buttonBar from "./button-bar.js";
import textInput from "./text-input.js";
import textarea from "./textarea.js";
import searchInput from "./search-input.js";
import checkbox from "./checkbox.js";
import radioButton from "./radio-button.js";
import switchComponent from "./switch.js";
import range from "./range.js";
import list from "./list.js";
import navigationBar from "./navigation-bar.js";
import tabBar from "./tab-bar.js";
import notification from "./notification.js";
import select from "./select.js";
import field from "./field.js";
import tooltip from "./tooltip.js";

export default { ...button, ...iconButton, ...buttonBar, ...textInput, ...textarea, ...searchInput, ...checkbox, ...radioButton, ...switchComponent, ...range, ...list, ...navigationBar, ...tabBar, ...notification, ...select, ...field, ...tooltip };
