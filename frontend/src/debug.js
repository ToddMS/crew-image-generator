
console.log('=== Theme Debug ===');
console.log('HTML class:', document.documentElement.className);
console.log('CSS Variables:');
const styles = getComputedStyle(document.documentElement);
console.log('--white:', styles.getPropertyValue('--white'));
console.log('--gray-50:', styles.getPropertyValue('--gray-50'));
console.log('--gray-900:', styles.getPropertyValue('--gray-900'));

