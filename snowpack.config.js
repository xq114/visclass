module.exports = {
    mount: {
        public: '/',
        src: '/dist',
    },
    plugins: [
        "@snowpack/plugin-optimize",
        "@snowpack/plugin-webpack",
    ]
};