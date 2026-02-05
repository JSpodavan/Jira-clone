const initProfilePage = () => {
  const backButton = document.getElementById('back-button');
  const avatar = document.getElementById('avatar');
  const logoutButton = document.getElementById('logout-button');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileId = document.getElementById('profile-id');
  const copyIdButton = document.getElementById('copy-id');
  const projectsContainer = document.getElementById('projects-container');
  const tasksContainer = document.getElementById('tasks-container');
  const errorModal = document.getElementById('error-modal');
  const errorMessage = document.getElementById('error-message');
  const errorClose = document.getElementById('error-modal-close');
  const errorOk = document.getElementById('error-ok');

  let currentUser = null;

  const showErrorModal = (message) => {
    errorMessage.textContent = message;
    errorModal.classList.add('visible');
  };

  const closeErrorModal = () => {
    errorModal.classList.remove('visible');
  };

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      window.location.replace('/reg.html');
      return true;
    }
    return false;
  };

  const getInitials = (name, surname) => {
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = surname ? surname.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial || 'U';
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/auth/me');
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error loading profile');
        return;
      }
      const user = await response.json();
      currentUser = user;
      displayUserInfo(user);
    } catch (error) {
      console.error('Load profile error:', error);
      showErrorModal('Network error');
    }
  };

  const displayUserInfo = (user) => {
    const initials = getInitials(user.name, user.surname);
    const fullName = user.name && user.surname 
      ? `${user.name} ${user.surname}` 
      : user.email || 'User';

    profileName.textContent = fullName;
    profileEmail.textContent = user.email || '';
    profileId.textContent = user.id || '—';
    profileAvatar.textContent = initials;
    avatar.textContent = initials;
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Error loading projects');
        return;
      }
      const projects = await response.json();
      renderProjects(projects);
    } catch (error) {
      console.error('Load projects error:', error);
      showErrorModal('Network error');
    }
  };

  const renderProjects = (projects) => {
    projectsContainer.innerHTML = '';
    if (!projects || projects.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No projects';
      projectsContainer.appendChild(empty);
      return;
    }

    projects.forEach((project) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.addEventListener('click', () => {
        window.location.href = `/project.html?id=${project.id}`;
      });

      const title = document.createElement('h3');
      title.textContent = project.name || 'Untitled';

      const description = document.createElement('p');
      description.textContent = project.description || 'No description';

      const role = document.createElement('span');
      role.className = 'project-role';
      role.textContent = project.currentUserRole || 'MEMBER';

      card.appendChild(title);
      card.appendChild(description);
      card.appendChild(role);
      projectsContainer.appendChild(card);
    });
  };

  const loadTasks = async () => {
    try {
      const projectsResponse = await fetch('/api/projects');
      if (handleUnauthorized(projectsResponse)) {
        return;
      }
      if (!projectsResponse.ok) {
        showErrorModal('Error loading tasks');
        return;
      }
      const projects = await projectsResponse.json();
      
      const allTasks = [];
      for (const project of projects) {
        try {
          const tasksResponse = await fetch(`/api/task/project/${project.id}`);
          if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            const userTasks = tasks.filter(task => 
              task.assignee && currentUser && task.assignee.id === currentUser.id
            );
            allTasks.push(...userTasks.map(task => ({ ...task, projectName: project.name, projectId: project.id })));
          }
        } catch (error) {
          console.error(`Error loading tasks for project ${project.id}:`, error);
        }
      }
      
      renderTasks(allTasks);
    } catch (error) {
      console.error('Load tasks error:', error);
      showErrorModal('Network error');
    }
  };

  const renderTasks = (tasks) => {
    tasksContainer.innerHTML = '';
    if (!tasks || tasks.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No tasks';
      tasksContainer.appendChild(empty);
      return;
    }

    tasks.forEach((task) => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.addEventListener('click', () => {
        window.location.href = `/project.html?id=${task.projectId}`;
      });

      const title = document.createElement('h3');
      title.textContent = task.title || 'Untitled';

      const projectName = document.createElement('p');
      projectName.textContent = task.projectName || 'Project';
      projectName.style.fontSize = '13px';
      projectName.style.color = '#6b778c';
      projectName.style.marginBottom = '8px';

      const meta = document.createElement('div');
      meta.className = 'task-card-meta';

      const statusBadge = document.createElement('span');
      statusBadge.className = `task-status-badge ${task.status}`;
      statusBadge.textContent = task.status || 'TODO';

      const priorityBadge = document.createElement('span');
      priorityBadge.className = `task-priority-badge ${task.priority}`;
      priorityBadge.textContent = task.priority || 'MEDIUM';

      meta.appendChild(statusBadge);
      meta.appendChild(priorityBadge);

      card.appendChild(title);
      card.appendChild(projectName);
      card.appendChild(meta);
      tasksContainer.appendChild(card);
    });
  };

  backButton.addEventListener('click', () => {
    window.location.href = '/index.html';
  });

  copyIdButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(profileId.textContent);
    } catch (error) {
      console.error('Copy ID error:', error);
      showErrorModal('Failed to copy ID');
    }
  });

  errorClose.addEventListener('click', closeErrorModal);
  errorOk.addEventListener('click', closeErrorModal);

  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('/auth/logout', { method: 'POST' });
      if (response.ok) {
        window.location.replace('/reg.html');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  });

  const init = async () => {
    await loadUserProfile();
    await loadProjects();
    await loadTasks();
  };

  init();
};

window.addEventListener('DOMContentLoaded', initProfilePage);
