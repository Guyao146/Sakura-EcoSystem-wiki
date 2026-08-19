(function () {
  var key = 'sakura-wiki-theme'
  var root = document.documentElement

  function mode() {
    try { return localStorage.getItem(key) || 'night' } catch (error) { return 'night' }
  }

  function apply(value) {
    root.dataset.wikiTheme = value
    try { localStorage.setItem(key, value) } catch (error) {}
    var button = document.querySelector('[data-wiki-theme-toggle]')
    if (button) {
      button.textContent = value === 'night' ? '☀ 白天' : '☾ 夜晚'
      button.setAttribute('aria-label', value === 'night' ? '切换到白天模式' : '切换到夜晚模式')
      button.title = button.getAttribute('aria-label')
    }
  }

  function mount() {
    if (document.querySelector('[data-wiki-theme-toggle]')) return
    var button = document.createElement('button')
    button.type = 'button'
    button.dataset.wikiThemeToggle = 'true'
    button.addEventListener('click', function () { apply(mode() === 'night' ? 'day' : 'night') })
    document.body.appendChild(button)
    apply(mode())
  }

  apply(mode())
  document.addEventListener('DOMContentLoaded', mount)
  window.addEventListener('hashchange', mount)
})()