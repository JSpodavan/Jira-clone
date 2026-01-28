const initProjectPage = () => {
  const backButton = document.getElementById('back-button');
  const projectTitle = document.getElementById('project-title');
  const projectName = document.getElementById('project-name');
  const projectDescription = document.getElementById('project-description');
  const projectIdLabel = document.getElementById('project-id');
  const copyProjectIdButton = document.getElementById('copy-project-id');
  const editButton = document.getElementById('edit-project-button');
  const deleteButton = document.getElementById('delete-project-button');
  const membersContainer = document.getElementById('members-container');
  const requestsContainer = document.getElementById('requests-container');
  const addMemberForm = document.getElementById('add-member-form');
  const memberUserId = document.getElementById('member-user-id');
  const memberRole = document.getElementById('member-role');
  const requestsSection = document.querySelector('.requests-section');
  const addMemberSection = document.querySelector('.add-member');

  const editModal = document.getElementById('edit-modal');
  const editModalClose = document.getElementById('edit-modal-close');
  const editCancel = document.getElementById('edit-cancel');
  const editForm = document.getElementById('edit-project-form');
  const editName = document.getElementById('edit-project-name');
  const editDescription = document.getElementById('edit-project-description');

  const errorModal = document.getElementById('error-modal');
  const errorMessage = document.getElementById('error-message');
  const errorClose = document.getElementById('error-modal-close');
  const errorOk = document.getElementById('error-ok');

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  if (!projectId) {
    window.location.href = '/projects.html';
    return;
  }

  const showErrorModal = (message) => {
    errorMessage.textContent = message;
    errorModal.classList.add('visible');
  };

  const closeErrorModal = () => {
    errorModal.classList.remove('visible');
  };

  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      window.location.href = '/reg.html';
      return true;
    }
    return false;
  };

  let currentUserRole = null;

  const applyRoleVisibility = () => {
    const isMemberOnly = currentUserRole === 'MEMBER';
    if (editButton) {
      editButton.style.display = isMemberOnly ? 'none' : '';
    }
    if (deleteButton) {
      deleteButton.style.display = isMemberOnly ? 'none' : '';
    }
    if (requestsSection) {
      requestsSection.style.display = isMemberOnly ? 'none' : '';
    }
    if (addMemberSection) {
      addMemberSection.style.display = isMemberOnly ? 'none' : '';
    }
  };

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка загрузки проекта');
        return;
      }
      const data = await response.json();
      projectTitle.textContent = data.name ?? 'Проект';
      projectName.textContent = data.name ?? 'Без названия';
      projectDescription.textContent = data.description || 'Без описания';
      projectIdLabel.textContent = data.id ?? projectId;
      currentUserRole = data.currentUserRole ?? null;
      applyRoleVisibility();
      if (currentUserRole !== 'MEMBER') {
        loadRequests();
      } else {
        requestsContainer.innerHTML = '';
      }
      editName.value = data.name ?? '';
      editDescription.value = data.description ?? '';
    } catch (error) {
      console.error('Load project error:', error);
      showErrorModal('Ошибка сети');
    }
  };

  const renderMembers = (members) => {
    membersContainer.innerHTML = '';
    if (!members || members.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Нет участников';
      membersContainer.appendChild(empty);
      return;
    }

    members.forEach((member) => {
      const card = document.createElement('div');
      card.className = 'member-card';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      const user = member.user || {};
      name.textContent =
        user.name && user.surname
          ? `${user.name} ${user.surname}`
          : user.email || member.userId || 'Пользователь';

      const role = document.createElement('div');
      role.className = 'member-role';
      role.textContent = member.role ?? 'MEMBER';

      info.appendChild(name);
      info.appendChild(role);

      card.appendChild(info);

      if (currentUserRole && currentUserRole !== 'MEMBER') {
        const removeButton = document.createElement('button');
        removeButton.className = 'ghost';
        removeButton.textContent = 'Удалить';
        removeButton.addEventListener('click', async () => {
          await removeMember(member.id);
        });
        card.appendChild(removeButton);
      }
      membersContainer.appendChild(card);
    });
  };

  const loadMembers = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка загрузки участников');
        return;
      }
      const data = await response.json().catch(() => []);
      renderMembers(data);
    } catch (error) {
      console.error('Load members error:', error);
      showErrorModal('Ошибка сети');
    }
  };

  const renderRequests = (requests) => {
    requestsContainer.innerHTML = '';
    if (!requests || requests.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Нет заявок';
      requestsContainer.appendChild(empty);
      return;
    }

    requests.forEach((request) => {
      const card = document.createElement('div');
      card.className = 'request-card';

      const info = document.createElement('div');
      info.className = 'member-info';

      const name = document.createElement('div');
      name.className = 'member-name';
      const user = request.user || {};
      name.textContent =
        user.name && user.surname
          ? `${user.name} ${user.surname}`
          : user.email || request.userId || 'Пользователь';

      const role = document.createElement('div');
      role.className = 'member-role';
      role.textContent = 'Заявка на вступление';

      info.appendChild(name);
      info.appendChild(role);

      const actions = document.createElement('div');
      actions.className = 'request-actions';

      const acceptButton = document.createElement('button');
      acceptButton.className = 'primary';
      acceptButton.textContent = 'Принять';
      acceptButton.addEventListener('click', async () => {
        await respondToRequest(request.id, 'accept');
      });

      const rejectButton = document.createElement('button');
      rejectButton.className = 'ghost';
      rejectButton.textContent = 'Отклонить';
      rejectButton.addEventListener('click', async () => {
        await respondToRequest(request.id, 'reject');
      });

      actions.appendChild(acceptButton);
      actions.appendChild(rejectButton);

      card.appendChild(info);
      card.appendChild(actions);
      requestsContainer.appendChild(card);
    });
  };

  const loadRequests = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/Invitation`);
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка загрузки заявок');
        return;
      }
      const data = await response.json().catch(() => []);
      renderRequests(data);
    } catch (error) {
      console.error('Load requests error:', error);
      showErrorModal('Ошибка сети');
    }
  };

  const respondToRequest = async (invitationId, action) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/Invitation/${invitationId}/${action}`,
        { method: 'POST' },
      );
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка обработки заявки');
        return;
      }
      await loadRequests();
      await loadMembers();
    } catch (error) {
      console.error('Respond request error:', error);
      showErrorModal('Ошибка сети');
    }
  };

  const removeMember = async (memberId) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberId}`,
        { method: 'DELETE' },
      );
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка удаления участника');
        return;
      }
      await loadMembers();
    } catch (error) {
      console.error('Remove member error:', error);
      showErrorModal('Ошибка сети');
    }
  };

  const openEditModal = () => {
    editModal.classList.add('visible');
  };

  const closeEditModal = () => {
    editModal.classList.remove('visible');
  };

  backButton.addEventListener('click', () => {
    window.location.href = '/projects.html';
  });

  copyProjectIdButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(projectId);
    } catch (error) {
      console.error('Copy project id error:', error);
      showErrorModal('Не удалось скопировать ID');
    }
  });

  editButton.addEventListener('click', openEditModal);
  editModalClose.addEventListener('click', closeEditModal);
  editCancel.addEventListener('click', closeEditModal);

  errorClose.addEventListener('click', closeErrorModal);
  errorOk.addEventListener('click', closeErrorModal);

  deleteButton.addEventListener('click', async () => {
    const confirmed = window.confirm('Удалить проект?');
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка удаления проекта');
        return;
      }
      window.location.href = '/projects.html';
    } catch (error) {
      console.error('Delete project error:', error);
      showErrorModal('Ошибка сети');
    }
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = editName.value.trim();
    const description = editDescription.value.trim();
    const payload = {};
    if (name.length > 0) {
      payload.name = name;
    }
    if (description.length > 0) {
      payload.description = description;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        showErrorModal('Ошибка обновления проекта');
        return;
      }
      closeEditModal();
      await loadProject();
    } catch (error) {
      console.error('Update project error:', error);
      showErrorModal('Ошибка сети');
    }
  });

  addMemberForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = memberUserId.value.trim();
    const role = memberRole.value;
    if (!userId) {
      showErrorModal('User ID не может быть пустым');
      return;
    }
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });
      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        showErrorModal(data?.message ?? 'Ошибка добавления участника');
        return;
      }
      memberUserId.value = '';
      await loadMembers();
    } catch (error) {
      console.error('Add member error:', error);
      showErrorModal('Ошибка сети');
    }
  });

  loadProject();
  loadMembers();
};

window.addEventListener('DOMContentLoaded', initProjectPage);
