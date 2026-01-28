const initProjectsPage = () => {
  const backButton = document.getElementById('back-button');
  const createButton = document.getElementById('create-project-button');
  const joinButton = document.getElementById('join-project-button');
  const createModal = document.getElementById('create-modal');
  const createModalClose = document.getElementById('create-modal-close');
  const createCancel = document.getElementById('create-cancel');
  const createForm = document.getElementById('create-project-form');
  const projectNameInput = document.getElementById('project-name');
  const projectDescriptionInput = document.getElementById('project-description');
  const errorModal = document.getElementById('error-modal');
  const errorMessage = document.getElementById('error-message');
  const errorClose = document.getElementById('error-modal-close');
  const errorOk = document.getElementById('error-ok');
  const projectsContainer = document.getElementById('projects-container');
  const joinModal = document.getElementById('join-modal');
  const joinModalClose = document.getElementById('join-modal-close');
  const joinCancel = document.getElementById('join-cancel');
  const joinForm = document.getElementById('join-project-form');
  const joinProjectId = document.getElementById('join-project-id');
  const resultModal = document.getElementById('result-modal');
  const resultStatus = document.getElementById('result-status');
  const resultMessage = document.getElementById('result-message');
  const resultClose = document.getElementById('result-modal-close');
  const resultOk = document.getElementById('result-ok');

  const openCreateModal = () => {
    projectNameInput.value = '';
    projectDescriptionInput.value = '';
    createModal.classList.add('visible');
    errorModal.classList.remove('visible');
  };

  const closeCreateModal = () => {
    createModal.classList.remove('visible');
  };

  const showErrorModal = (message) => {
    errorMessage.textContent = message;
    createModal.classList.remove('visible');
    errorModal.classList.add('visible');
  };

  const closeErrorModal = () => {
    errorModal.classList.remove('visible');
  };

  let resultAutoCloseTimer = null;

  const showResultModal = (status, message, showCloseButton = false) => {
    resultStatus.textContent = status;
    resultMessage.textContent = message;
    resultOk.style.display = showCloseButton ? '' : 'none';
    resultModal.classList.add('visible');
    joinModal.classList.remove('visible');
    if (resultAutoCloseTimer) {
      clearTimeout(resultAutoCloseTimer);
    }
    resultAutoCloseTimer = setTimeout(() => {
      resultModal.classList.remove('visible');
    }, 2000);
  };

  const closeResultModal = () => {
    if (resultAutoCloseTimer) {
      clearTimeout(resultAutoCloseTimer);
      resultAutoCloseTimer = null;
    }
    resultModal.classList.remove('visible');
  };

  const openJoinModal = () => {
    joinProjectId.value = '';
    joinModal.classList.add('visible');
    errorModal.classList.remove('visible');
    resultModal.classList.remove('visible');
  };

  const closeJoinModal = () => {
    joinModal.classList.remove('visible');
  };

  const renderProjects = (projects) => {
    projectsContainer.innerHTML = '';
    if (!projects || projects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Пока нет проектов';
      projectsContainer.appendChild(empty);
      return;
    }

    projects.forEach((project) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.addEventListener('click', () => {
        if (project?.id) {
          window.location.href = `/project.html?id=${project.id}`;
        }
      });

      const title = document.createElement('div');
      title.className = 'project-title';
      title.textContent = project.name ?? 'Без названия';

      const description = document.createElement('div');
      description.className = 'project-description';
      description.textContent = project.description || 'Без описания';

      card.appendChild(title);
      card.appendChild(description);
      projectsContainer.appendChild(card);
    });
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.status === 401) {
        window.location.href = '/reg.html';
        return;
      }
      if (response.status >= 500) {
        showErrorModal('Ошибка сервера');
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(data)) {
        showErrorModal('Ошибка загрузки проектов');
        return;
      }
      renderProjects(data);
    } catch (error) {
      console.error('Load projects error:', error);
      showErrorModal('Ошибка сети');
    }
  };

  backButton.addEventListener('click', () => {
    window.location.href = '/index.html';
  });

  createButton.addEventListener('click', openCreateModal);
  createModalClose.addEventListener('click', closeCreateModal);
  createCancel.addEventListener('click', closeCreateModal);

  errorClose.addEventListener('click', closeErrorModal);
  errorOk.addEventListener('click', closeErrorModal);

  joinButton.addEventListener('click', openJoinModal);
  joinModalClose.addEventListener('click', closeJoinModal);
  joinCancel.addEventListener('click', closeJoinModal);

  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = projectNameInput.value.trim();
    const description = projectDescriptionInput.value.trim();

    if (name.length < 1) {
      showErrorModal('Название проекта не может быть пустым');
      return;
    }

    const payload = { name };
    if (description.length > 0) {
      payload.description = description;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        window.location.href = '/reg.html';
        return;
      }

      if (response.status === 201) {
        closeCreateModal();
        projectNameInput.value = '';
        projectDescriptionInput.value = '';
        await loadProjects();
        return;
      }

      if (response.status === 400) {
        const data = await response.json().catch(() => null);
        showErrorModal(data?.message ?? 'Ошибка валидации');
        return;
      }

      if (response.status >= 500) {
        showErrorModal('Ошибка сервера');
        return;
      }

      showErrorModal('Ошибка запроса');
    } catch (error) {
      console.error('Create project error:', error);
      showErrorModal('Ошибка сети');
    }
  });

  joinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const projectId = joinProjectId.value.trim();
    if (!projectId) {
      showResultModal('error', 'ID проекта не может быть пустым');
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        window.location.href = '/reg.html';
        return;
      }

      if (response.ok) {
        showResultModal('ok', 'Заявка отправлена');
        joinProjectId.value = '';
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status >= 500) {
        showResultModal('error', 'Ошибка сервера');
        return;
      }
      showResultModal('error', data?.message ?? 'Ошибка присоединения');
    } catch (error) {
      console.error('Join project error:', error);
      showResultModal('error', 'Ошибка сети');
    }
  });

  resultClose.addEventListener('click', closeResultModal);
  resultOk.addEventListener('click', closeResultModal);

  loadProjects();
};

window.addEventListener('DOMContentLoaded', initProjectsPage);
