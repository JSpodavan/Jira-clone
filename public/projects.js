const initProjectsPage = () => {
  const backButton = document.getElementById('back-button');
  const avatar = document.getElementById('avatar');
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
  const projectsSelectList = document.getElementById('projects-select-list');
  const projectsPrevPage = document.getElementById('projects-prev-page');
  const projectsNextPage = document.getElementById('projects-next-page');
  const projectsPageInfo = document.getElementById('projects-page-info');
  const joinByIdDiv = document.getElementById('join-by-id');
  const joinByListDiv = document.getElementById('join-by-list');
  const resultModal = document.getElementById('result-modal');

  let selectedProjectId = null;
  let availableProjects = [];
  let currentProjectsPage = 1;
  const projectsPerPage = 10;
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

  const openJoinModal = async () => {
    joinProjectId.value = '';
    joinModal.classList.add('visible');
    errorModal.classList.remove('visible');
    resultModal.classList.remove('visible');
    await loadAvailableProjects();
  };

  const renderAvailableProjects = () => {
    const startIndex = (currentProjectsPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    const pageProjects = availableProjects.slice(startIndex, endIndex);
    const totalPages = Math.ceil(availableProjects.length / projectsPerPage);

    projectsPageInfo.textContent = `Page ${currentProjectsPage} of ${totalPages || 1}`;
    projectsPrevPage.disabled = currentProjectsPage === 1;
    projectsNextPage.disabled = currentProjectsPage >= totalPages;

    if (!pageProjects || pageProjects.length === 0) {
      projectsSelectList.innerHTML = '<div class="empty-state">No available projects</div>';
      return;
    }

    projectsSelectList.innerHTML = '';
    pageProjects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'project-select-card';
      card.dataset.projectId = project.id;
      
      const title = document.createElement('div');
      title.className = 'project-select-title';
      title.textContent = project.name;
      
      const description = document.createElement('div');
      description.className = 'project-select-description';
      description.textContent = project.description || 'No description';
      
      card.appendChild(title);
      card.appendChild(description);
      
      card.addEventListener('click', () => {
        document.querySelectorAll('.project-select-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedProjectId = project.id;
      });
      
      projectsSelectList.appendChild(card);
    });
  };

  const loadAvailableProjects = async () => {
    try {
      const response = await fetch('/api/projects/public/list');
      if (response.status === 401) {
        window.location.href = '/reg.html';
        return;
      }
      if (!response.ok) {
        projectsSelectList.innerHTML = '<div class="empty-state">Error loading projects</div>';
        return;
      }
      const projects = await response.json();
      availableProjects = projects;
      currentProjectsPage = 1;
      renderAvailableProjects();
    } catch (error) {
      console.error('Load available projects error:', error);
      projectsSelectList.innerHTML = '<div class="empty-state">Error loading projects</div>';
    }
  };

  const closeJoinModal = () => {
    joinModal.classList.remove('visible');
  };

  const renderProjects = (projects) => {
    projectsContainer.innerHTML = '';
    if (!projects || projects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No projects yet';
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
      title.textContent = project.name ?? 'Untitled';

      const description = document.createElement('div');
      description.className = 'project-description';
      description.textContent = project.description || 'No description';

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
        showErrorModal('Server error');
        return;
      }
      const data = await response.json().catch(() => null);
      if (!response.ok || !Array.isArray(data)) {
        showErrorModal('Error loading projects');
        return;
      }
      renderProjects(data);
    } catch (error) {
      console.error('Load projects error:', error);
      showErrorModal('Network error');
    }
  };

  backButton.addEventListener('click', () => {
    window.location.href = '/index.html';
  });

  avatar.addEventListener('click', () => {
    window.location.href = '/profile.html';
  });

  createButton.addEventListener('click', openCreateModal);
  createModalClose.addEventListener('click', closeCreateModal);
  createCancel.addEventListener('click', closeCreateModal);

  errorClose.addEventListener('click', closeErrorModal);
  errorOk.addEventListener('click', closeErrorModal);

  joinButton.addEventListener('click', openJoinModal);
  joinModalClose.addEventListener('click', closeJoinModal);
  joinCancel.addEventListener('click', closeJoinModal);

  let currentJoinMethod = 'id';

  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentJoinMethod = e.target.dataset.method;
      selectedProjectId = null;
      currentProjectsPage = 1;
      
      if (currentJoinMethod === 'id') {
        joinByIdDiv.classList.remove('hidden');
        joinByListDiv.classList.add('hidden');
      } else {
        joinByIdDiv.classList.add('hidden');
        joinByListDiv.classList.remove('hidden');
        renderAvailableProjects();
      }
    });
  });

  projectsPrevPage.addEventListener('click', () => {
    if (currentProjectsPage > 1) {
      currentProjectsPage--;
      selectedProjectId = null;
      renderAvailableProjects();
    }
  });

  projectsNextPage.addEventListener('click', () => {
    const totalPages = Math.ceil(availableProjects.length / projectsPerPage);
    if (currentProjectsPage < totalPages) {
      currentProjectsPage++;
      selectedProjectId = null;
      renderAvailableProjects();
    }
  });

  createForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = projectNameInput.value.trim();
    const description = projectDescriptionInput.value.trim();

    if (name.length < 1) {
      showErrorModal('Project name cannot be empty');
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
        showErrorModal(data?.message ?? 'Validation error');
        return;
      }

      if (response.status >= 500) {
        showErrorModal('Server error');
        return;
      }

      showErrorModal('Request error');
    } catch (error) {
      console.error('Create project error:', error);
      showErrorModal('Network error');
    }
  });

  joinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const projectId = currentJoinMethod === 'id' ? joinProjectId.value.trim() : selectedProjectId;
    
    if (!projectId) {
      showResultModal('error', 'Please select or enter a project');
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
        showResultModal('ok', 'Request sent');
        joinProjectId.value = '';
        return;
      }

      const data = await response.json().catch(() => null);
      if (response.status >= 500) {
        showResultModal('error', 'Server error');
        return;
      }
      showResultModal('error', data?.message ?? 'Error joining project');
    } catch (error) {
      console.error('Join project error:', error);
      showResultModal('error', 'Network error');
    }
  });

  resultClose.addEventListener('click', closeResultModal);
  resultOk.addEventListener('click', closeResultModal);

  loadProjects();
};

window.addEventListener('DOMContentLoaded', initProjectsPage);
