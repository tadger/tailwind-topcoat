// One spread per component file. Later spreads win on identical selectors (key order = cascade order).
import button from "./button.js";
import iconButton from "./icon-button.js";
import buttonBar from "./button-bar.js";
import textInput from "./text-input.js";
import textarea from "./textarea.js";
import searchInput from "./search-input.js";

export default { ...button, ...iconButton, ...buttonBar, ...textInput, ...textarea, ...searchInput };
