/**
 * Storybook decorator that allows wrapping an Angular component
 * From: https://github.com/storybookjs/storybook/issues/2962#issuecomment-510030909
 * @todo remove if really not needed
 */
// export const sbComponentWrapper =
//   (templateFn: (content: string) => string) => (storyFn: () => any) => {
//     const story = storyFn();

//     const selector: string = story.component.__annotations__[0].selector;
//     const inputs: string[] = [];
//     const outputs: string[] = [];

//     const componentProps = story.component.__prop__metadata__;
//     for (const key in componentProps) {
//       if (
//         Object.getPrototypeOf(componentProps[key][0]).ngMetadataName === 'Input' &&
//         story.props.hasOwnProperty(key)
//       ) {
//         inputs.push(key);
//       } else if (
//         Object.getPrototypeOf(componentProps[key][0]).ngMetadataName === 'Output' &&
//         story.props.hasOwnProperty(key)
//       ) {
//         outputs.push(key);
//       }
//     }

//     const inputStr: string = inputs.map((input) => `[${input}]="${input}"`).join(' ');
//     const outputStr: string = outputs
//       .map((output) => `(${output})="${output}"`)
//       .join(' ');

//     const template = `<${selector} ${inputStr} ${outputStr}></${selector}>`;

//     return {
//       ...story,
//       template: templateFn(template),
//     };
//   };
