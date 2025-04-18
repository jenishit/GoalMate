export function saveToLocalStorage(roadmap, checked) {
    localStorage.setItem('roadmap', JSON.stringify(roadmap));
    localStorage.setItem('checked', JSON.stringify(checked));
  }
  
  export function loadFromLocalStorage() {
    const roadmap = JSON.parse(localStorage.getItem('roadmap')) || [];
    const checked = JSON.parse(localStorage.getItem('checked')) || {};
    return { roadmap, checked };
  }
  
  export function clearLocalStorage() {
    localStorage.removeItem('roadmap');
    localStorage.removeItem('checked');
  }