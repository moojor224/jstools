import { constant } from "./utility.js";
export const validStyles = constant([
    "-moz-box-align", "-moz-box-direction", "-moz-box-flex", "-moz-box-ordinal-group", "-moz-box-orient", "-moz-box-pack", "-moz-float-edge", "-moz-force-broken-image-icon", "-moz-orient", "-moz-text-size-adjust", "-moz-user-input", "-moz-user-modify", "-moz-window-dragging", "-webkit-border-horizontal-spacing",
    "-webkit-border-image", "-webkit-border-vertical-spacing", "-webkit-box-align", "-webkit-box-decoration-break", "-webkit-box-direction", "-webkit-box-flex", "-webkit-box-ordinal-group", "-webkit-box-orient", "-webkit-box-pack", "-webkit-box-reflect", "-webkit-font-smoothing", "-webkit-line-break",
    "-webkit-line-clamp", "-webkit-locale", "-webkit-mask-box-image", "-webkit-mask-box-image-outset", "-webkit-mask-box-image-repeat", "-webkit-mask-box-image-slice", "-webkit-mask-box-image-source", "-webkit-mask-box-image-width", "-webkit-print-color-adjust", "-webkit-rtl-ordering",
    "-webkit-tap-highlight-color", "-webkit-text-combine", "-webkit-text-decorations-in-effect", "-webkit-text-fill-color", "-webkit-text-orientation", "-webkit-text-security", "-webkit-text-stroke-color", "-webkit-text-stroke-width", "-webkit-user-drag", "-webkit-user-modify", "-webkit-writing-mode",
    "accent-color", "accentColor", "align-content", "align-items", "align-self", "alignContent", "alignItems", "alignment-baseline", "alignmentBaseline", "alignSelf", "anchor-name", "anchorName", "animation", "animation-composition", "animation-delay", "animation-direction", "animation-duration",
    "animation-fill-mode", "animation-iteration-count", "animation-name", "animation-play-state", "animation-range-end", "animation-range-start", "animation-timeline", "animation-timing-function", "animationComposition", "animationDelay", "animationDirection", "animationDuration",
    "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationRangeEnd", "animationRangeStart", "animationTimeline", "animationTimingFunction", "app-region", "appearance", "appRegion", "aspect-ratio", "aspectRatio", "backdrop-filter", "backdropFilter",
    "backface-visibility", "backfaceVisibility", "background-attachment", "background-blend-mode", "background-clip", "background-color", "background-image", "background-origin", "background-position", "background-position-x", "background-position-y", "background-repeat", "background-size",
    "backgroundAttachment", "backgroundBlendMode", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPosition", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundSize", "baseline-shift", "baseline-source", "baselineShift",
    "baselineSource", "block-size", "blockSize", "border", "border-block-end-color", "border-block-end-style", "border-block-end-width", "border-block-start-color", "border-block-start-style", "border-block-start-width", "border-bottom", "border-bottom-color", "border-bottom-left-radius",
    "border-bottom-right-radius", "border-bottom-style", "border-bottom-width", "border-collapse", "border-color", "border-end-end-radius", "border-end-start-radius", "border-image-outset", "border-image-repeat", "border-image-slice", "border-image-source", "border-image-width", "border-inline-end-color",
    "border-inline-end-style", "border-inline-end-width", "border-inline-start-color", "border-inline-start-style", "border-inline-start-width", "border-left", "border-left-color", "border-left-style", "border-left-width", "border-radius", "border-right", "border-right-color", "border-right-style",
    "border-right-width", "border-spacing", "border-start-end-radius", "border-start-start-radius", "border-style", "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-style", "border-top-width", "border-width", "borderBlockEndColor",
    "borderBlockEndStyle", "borderBlockEndWidth", "borderBlockStartColor", "borderBlockStartStyle", "borderBlockStartWidth", "borderBottom", "borderBottomColor", "borderBottomLeftRadius", "borderBottomRightRadius", "borderBottomStyle", "borderBottomWidth", "borderCollapse", "borderColor",
    "borderEndEndRadius", "borderEndStartRadius", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderInlineEndColor", "borderInlineEndStyle", "borderInlineEndWidth", "borderInlineStartColor", "borderInlineStartStyle", "borderInlineStartWidth",
    "borderLeft", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRadius", "borderRight", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderSpacing", "borderStartEndRadius", "borderStartStartRadius", "borderStyle", "borderTop", "borderTopColor", "borderTopLeftRadius",
    "borderTopRightRadius", "borderTopStyle", "borderTopWidth", "borderWidth", "bottom", "box-decoration-break", "box-shadow", "box-sizing", "boxDecorationBreak", "boxShadow", "boxSizing", "break-after", "break-before", "break-inside", "breakAfter", "breakBefore", "breakInside", "buffered-rendering",
    "bufferedRendering", "caption-side", "captionSide", "caret-color", "caretColor", "clear", "clip", "clip-path", "clip-rule", "clipPath", "clipRule", "color", "color-interpolation", "color-interpolation-filters", "color-rendering", "color-scheme", "colorInterpolation", "colorInterpolationFilters",
    "colorRendering", "colorScheme", "column-count", "column-fill", "column-gap", "column-rule-color", "column-rule-style", "column-rule-width", "column-span", "column-width", "columnCount", "columnFill", "columnGap", "columnRuleColor", "columnRuleStyle", "columnRuleWidth", "columnSpan",
    "columnWidth", "contain", "contain-intrinsic-block-size", "contain-intrinsic-height", "contain-intrinsic-inline-size", "contain-intrinsic-size", "contain-intrinsic-width", "container-name", "container-type", "containerName", "containerType", "containIntrinsicBlockSize", "containIntrinsicHeight",
    "containIntrinsicInlineSize", "containIntrinsicSize", "containIntrinsicWidth", "content", "content-visibility", "contentVisibility", "counter-increment", "counter-reset", "counter-set", "counterIncrement", "counterReset", "counterSet", "cursor", "cx", "cy", "d", "direction", "display",
    "dominant-baseline", "dominantBaseline", "empty-cells", "emptyCells", "field-sizing", "fieldSizing", "fill", "fill-opacity", "fill-rule", "fillOpacity", "fillRule", "filter", "flex-basis", "flex-direction", "flex-grow", "flex-shrink", "flex-wrap", "flexBasis", "flexDirection",
    "flexGrow", "flexShrink", "flexWrap", "float", "flood-color", "flood-opacity", "floodColor", "floodOpacity", "font-family", "font-feature-settings", "font-kerning", "font-language-override", "font-optical-sizing", "font-palette", "font-size", "font-size-adjust", "font-stretch",
    "font-style", "font-synthesis-position", "font-synthesis-small-caps", "font-synthesis-style", "font-synthesis-weight", "font-variant", "font-variant-alternates", "font-variant-caps", "font-variant-east-asian", "font-variant-ligatures", "font-variant-numeric", "font-variant-position",
    "font-variation-settings", "font-weight", "fontFamily", "fontFeatureSettings", "fontKerning", "fontLanguageOverride", "fontOpticalSizing", "fontPalette", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontSynthesisPosition", "fontSynthesisSmallCaps", "fontSynthesisStyle",
    "fontSynthesisWeight", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontVariationSettings", "fontWeight", "forced-color-adjust", "forcedColorAdjust", "gap", "grid-auto-columns",
    "grid-auto-flow", "grid-auto-rows", "grid-column", "grid-column-end", "grid-column-start", "grid-row", "grid-row-end", "grid-row-start", "grid-template-areas", "grid-template-columns", "grid-template-rows", "gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridColumn", "gridColumnEnd",
    "gridColumnStart", "gridRow", "gridRowEnd", "gridRowStart", "gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows", "height", "hyphenate-character", "hyphenate-limit-chars", "hyphenateCharacter", "hyphenateLimitChars", "hyphens", "image-orientation", "image-rendering",
    "imageOrientation", "imageRendering", "ime-mode", "imeMode", "initial-letter", "initialLetter", "inline-size", "inlineSize", "inset-area", "inset-block-end", "inset-block-start", "inset-inline-end", "inset-inline-start", "insetArea", "insetBlockEnd", "insetBlockStart", "insetInlineEnd",
    "insetInlineStart", "isolation", "justify-content", "justify-items", "justify-self", "justifyContent", "justifyItems", "justifySelf", "left", "letter-spacing", "letterSpacing", "lighting-color", "lightingColor", "line-break", "line-height", "lineBreak", "lineHeight", "list-style-image",
    "list-style-position", "list-style-type", "listStyleImage", "listStylePosition", "listStyleType", "margin", "margin-block-end", "margin-block-start", "margin-bottom", "margin-inline-end", "margin-inline-start", "margin-left", "margin-right", "margin-top", "marginBlockEnd", "marginBlockStart",
    "marginBottom", "marginInlineEnd", "marginInlineStart", "marginLeft", "marginRight", "marginTop", "marker-end", "marker-mid", "marker-start", "markerEnd", "markerMid", "markerStart", "mask-clip", "mask-composite", "mask-image", "mask-mode", "mask-origin", "mask-position", "mask-position-x",
    "mask-position-y", "mask-repeat", "mask-size", "mask-type", "maskClip", "maskComposite", "maskImage", "maskMode", "maskOrigin", "maskPosition", "maskPositionX", "maskPositionY", "maskRepeat", "maskSize", "maskType", "math-depth", "math-shift", "math-style", "mathDepth", "mathShift",
    "mathStyle", "max-block-size", "max-height", "max-inline-size", "max-width", "maxBlockSize", "maxHeight", "maxInlineSize", "maxWidth", "min-block-size", "min-height", "min-inline-size", "min-width", "minBlockSize", "minHeight", "minInlineSize", "minWidth", "mix-blend-mode", "mixBlendMode",
    "MozBoxAlign", "MozBoxDirection", "MozBoxFlex", "MozBoxOrdinalGroup", "MozBoxOrient", "MozBoxPack", "MozFloatEdge", "MozForceBrokenImageIcon", "MozOrient", "MozTextSizeAdjust", "MozUserInput", "MozUserModify", "MozWindowDragging", "object-fit", "object-position", "object-view-box",
    "objectFit", "objectPosition", "objectViewBox", "offset-anchor", "offset-distance", "offset-path", "offset-position", "offset-rotate", "offsetAnchor", "offsetDistance", "offsetPath", "offsetPosition", "offsetRotate", "opacity", "order", "orphans", "outline-color", "outline-offset",
    "outline-style", "outline-width", "outlineColor", "outlineOffset", "outlineStyle", "outlineWidth", "overflow", "overflow-anchor", "overflow-block", "overflow-clip-margin", "overflow-inline", "overflow-wrap", "overflow-x", "overflow-y", "overflowAnchor", "overflowBlock", "overflowClipMargin",
    "overflowInline", "overflowWrap", "overflowX", "overflowY", "overlay", "overscroll-behavior-block", "overscroll-behavior-inline", "overscroll-behavior-x", "overscroll-behavior-y", "overscrollBehaviorBlock", "overscrollBehaviorInline", "overscrollBehaviorX", "overscrollBehaviorY",
    "padding", "padding-block-end", "padding-block-start", "padding-bottom", "padding-inline-end", "padding-inline-start", "padding-left", "padding-right", "padding-top", "paddingBlockEnd", "paddingBlockStart", "paddingBottom", "paddingInlineEnd", "paddingInlineStart", "paddingLeft",
    "paddingRight", "paddingTop", "page", "paint-order", "paintOrder", "perspective", "perspective-origin", "perspectiveOrigin", "pointer-events", "pointerEvents", "position", "position-anchor", "position-try-options", "position-try-order", "position-visibility", "positionAnchor",
    "positionTryOptions", "positionTryOrder", "positionVisibility", "print-color-adjust", "printColorAdjust", "quotes", "r", "resize", "right", "rotate", "row-gap", "rowGap", "ruby-align", "ruby-position", "rubyAlign", "rubyPosition", "rx", "ry", "scale", "scroll-behavior", "scroll-margin-block-end",
    "scroll-margin-block-start", "scroll-margin-bottom", "scroll-margin-inline-end", "scroll-margin-inline-start", "scroll-margin-left", "scroll-margin-right", "scroll-margin-top", "scroll-padding-block-end", "scroll-padding-block-start", "scroll-padding-bottom", "scroll-padding-inline-end",
    "scroll-padding-inline-start", "scroll-padding-left", "scroll-padding-right", "scroll-padding-top", "scroll-snap-align", "scroll-snap-stop", "scroll-snap-type", "scroll-timeline-axis", "scroll-timeline-name", "scrollbar-color", "scrollbar-gutter", "scrollbar-width", "scrollbarColor",
    "scrollbarGutter", "scrollbarWidth", "scrollBehavior", "scrollMarginBlockEnd", "scrollMarginBlockStart", "scrollMarginBottom", "scrollMarginInlineEnd", "scrollMarginInlineStart", "scrollMarginLeft", "scrollMarginRight", "scrollMarginTop", "scrollPaddingBlockEnd", "scrollPaddingBlockStart",
    "scrollPaddingBottom", "scrollPaddingInlineEnd", "scrollPaddingInlineStart", "scrollPaddingLeft", "scrollPaddingRight", "scrollPaddingTop", "scrollSnapAlign", "scrollSnapStop", "scrollSnapType", "scrollTimelineAxis", "scrollTimelineName", "shape-image-threshold", "shape-margin",
    "shape-outside", "shape-rendering", "shapeImageThreshold", "shapeMargin", "shapeOutside", "shapeRendering", "speak", "stop-color", "stop-opacity", "stopColor", "stopOpacity", "stroke", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit",
    "stroke-opacity", "stroke-width", "strokeDasharray", "strokeDashoffset", "strokeLinecap", "strokeLinejoin", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "tab-size", "table-layout", "tableLayout", "tabSize", "text-align", "text-align-last", "text-anchor", "text-combine-upright",
    "text-decoration", "text-decoration-color", "text-decoration-line", "text-decoration-skip-ink", "text-decoration-style", "text-decoration-thickness", "text-emphasis-color", "text-emphasis-position", "text-emphasis-style", "text-indent", "text-justify", "text-orientation", "text-overflow",
    "text-rendering", "text-shadow", "text-size-adjust", "text-spacing-trim", "text-transform", "text-underline-offset", "text-underline-position", "text-wrap", "text-wrap-mode", "text-wrap-style", "textAlign", "textAlignLast", "textAnchor", "textCombineUpright", "textDecoration",
    "textDecorationColor", "textDecorationLine", "textDecorationSkipInk", "textDecorationStyle", "textDecorationThickness", "textEmphasisColor", "textEmphasisPosition", "textEmphasisStyle", "textIndent", "textJustify", "textOrientation", "textOverflow", "textRendering", "textShadow",
    "textSizeAdjust", "textSpacingTrim", "textTransform", "textUnderlineOffset", "textUnderlinePosition", "textWrap", "textWrapMode", "textWrapStyle", "timeline-scope", "timelineScope", "top", "touch-action", "touchAction", "transform", "transform-box", "transform-origin", "transform-style",
    "transformBox", "transformOrigin", "transformStyle", "transition-behavior", "transition-delay", "transition-duration", "transition-property", "transition-timing-function", "transitionBehavior", "transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction",
    "translate", "undefined", "unicode-bidi", "unicodeBidi", "user-select", "userSelect", "vector-effect", "vectorEffect", "vertical-align", "verticalAlign", "view-timeline-axis", "view-timeline-inset", "view-timeline-name", "view-transition-class", "view-transition-name", "viewTimelineAxis",
    "viewTimelineInset", "viewTimelineName", "viewTransitionClass", "viewTransitionName", "visibility", "WebkitBorderHorizontalSpacing", "WebkitBorderImage", "WebkitBorderVerticalSpacing", "WebkitBoxAlign", "WebkitBoxDecorationBreak", "WebkitBoxDirection", "WebkitBoxFlex", "WebkitBoxOrdinalGroup",
    "WebkitBoxOrient", "WebkitBoxPack", "WebkitBoxReflect", "WebkitFontSmoothing", "WebkitLineBreak", "WebkitLineClamp", "WebkitLocale", "WebkitMaskBoxImage", "WebkitMaskBoxImageOutset", "WebkitMaskBoxImageRepeat", "WebkitMaskBoxImageSlice", "WebkitMaskBoxImageSource", "WebkitMaskBoxImageWidth",
    "WebkitPrintColorAdjust", "WebkitRtlOrdering", "WebkitTapHighlightColor", "WebkitTextCombine", "WebkitTextDecorationsInEffect", "WebkitTextFillColor", "WebkitTextOrientation", "WebkitTextSecurity", "WebkitTextStrokeColor", "WebkitTextStrokeWidth", "WebkitUserDrag", "WebkitUserModify",
    "WebkitWritingMode", "white-space-collapse", "whiteSpaceCollapse", "widows", "width", "will-change", "willChange", "word-break", "word-spacing", "wordBreak", "wordSpacing", "writing-mode", "writingMode", "x", "y", "z-index", "zIndex", "zoom",
    "gridTemplate", "grid-template",
]);