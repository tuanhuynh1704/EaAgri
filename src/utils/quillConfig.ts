import { Quill } from "react-quill-new";

// Register custom line-height style attributor with Quill (Quill 2.0 / Parchment v3 compatible)
const Parchment: any = Quill.import("parchment");
const StyleAttributor = Parchment.StyleAttributor || (Parchment.Attributor && Parchment.Attributor.Style);
const LineHeightStyle = new StyleAttributor(
  "lineheight",
  "line-height",
  {
    scope: Parchment.Scope.INLINE,
    whitelist: ["1.0", "1.2", "1.5", "1.8", "2.0", "2.5", "3.0"]
  }
);
Quill.register(
  {
    "attributors/style/lineheight": LineHeightStyle,
    "formats/lineheight": LineHeightStyle,
  },
  true
);

export const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ lineheight: ["1.0", "1.2", "1.5", "1.8", "2.0", "2.5", "3.0", false] }],
    ["link", "image"],
    ["clean"],
  ],
};

export const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "align",
  "lineheight",
  "link",
  "image",
];
