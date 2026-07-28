export const buildInfo = Object.freeze({
  release: typeof __APP_RELEASE__ === 'string' ? __APP_RELEASE__ : '',
  environment:
    typeof __APP_ENVIRONMENT__ === 'string' ? __APP_ENVIRONMENT__ : '',
});
