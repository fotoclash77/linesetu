module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { unstable_transformImportMeta: true }]],
    plugins: [
      ({ types: t }) => ({
        visitor: {
          MemberExpression(path) {
            if (
              t.isMemberExpression(path.node.object) &&
              t.isIdentifier(path.node.object.object, { name: "process" }) &&
              t.isIdentifier(path.node.object.property, { name: "env" }) &&
              t.isIdentifier(path.node.property, { name: "EXPO_BASE_URL" })
            ) {
              path.replaceWith(t.stringLiteral("/patient-app"));
            }
          },
        },
      }),
    ],
  };
};
