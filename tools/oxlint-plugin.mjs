// Project rules oxlint has no built-in for. Loaded through `jsPlugins` in
// .oxlintrc.json.

const isPascalCase = (name) => /^[A-Z][A-Za-z0-9]*$/.test(name);

/** `React.FC` or `FC`, with its type arguments. */
function fcTypeArgs(annotation) {
  const type = annotation?.typeAnnotation;
  if (type?.type !== "TSTypeReference") {
    return null;
  }
  const name = type.typeName;
  const isFc =
    (name.type === "Identifier" && name.name === "FC") ||
    (name.type === "TSQualifiedName" &&
      name.left.type === "Identifier" &&
      name.left.name === "React" &&
      name.right.name === "FC");
  if (!isFc) {
    return null;
  }
  return (type.typeArguments ?? type.typeParameters)?.params ?? [];
}

/**
 * A component is `const Name: React.FC<NameProps> = (props) => ...`, with
 * `interface NameProps` declared in the same file. No inline prop types.
 */
const componentPropsInterface = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Type components as React.FC<NameProps>, with NameProps an interface",
    },
    schema: [],
  },
  create(context) {
    const interfaces = new Set();
    const typeAliases = new Map();
    const wanted = [];

    return {
      TSInterfaceDeclaration(node) {
        interfaces.add(node.id.name);
      },
      TSTypeAliasDeclaration(node) {
        typeAliases.set(node.id.name, node);
      },
      VariableDeclarator(node) {
        const init = node.init;
        if (
          node.id.type !== "Identifier" ||
          !isPascalCase(node.id.name) ||
          (init?.type !== "ArrowFunctionExpression" &&
            init?.type !== "FunctionExpression")
        ) {
          return;
        }
        const name = node.id.name;
        const args = fcTypeArgs(node.id.typeAnnotation);
        if (args == null) {
          context.report({
            node: node.id,
            message: `Type the component as \`const ${name}: React.FC<${name}Props> = (...) => ...\`.`,
          });
          return;
        }
        const param = init.params[0];
        if (param?.typeAnnotation) {
          context.report({
            node: param.typeAnnotation,
            message: `Don't type the props inline: put them in \`interface ${name}Props\` and use \`React.FC<${name}Props>\`.`,
          });
        }
        if (param == null) {
          return;
        }
        const arg = args[0];
        const argName =
          arg?.type === "TSTypeReference" && arg.typeName.type === "Identifier"
            ? arg.typeName.name
            : null;
        if (argName !== `${name}Props`) {
          context.report({
            node: arg ?? node.id,
            message: `Name the props \`${name}Props\`: \`React.FC<${name}Props>\`.`,
          });
          return;
        }
        wanted.push({ name: argName, node: arg });
      },
      "Program:exit"() {
        for (const { name, node } of wanted) {
          if (interfaces.has(name)) {
            continue;
          }
          context.report({
            node: typeAliases.get(name) ?? node,
            message: typeAliases.has(name)
              ? `Declare \`${name}\` as an interface, not a type alias.`
              : `Declare \`interface ${name}\` in this file.`,
          });
        }
      },
    };
  },
};

export default {
  meta: { name: "formatos" },
  rules: { "component-props-interface": componentPropsInterface },
};
