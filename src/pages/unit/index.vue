<template>
  <!-- Quản lý các Unit (chỉ hiển thị khi không xem lesson) -->
  <div v-if="!showLessonManagement">
    <v-row class="">
      <!-- Toolbar Sticky -->
      <v-col cols="12" class="toolbar-sticky z-index-10" :class="{ 'toolbar-hidden': isToolbarHidden }">
        <v-card class="mb-2" elevation="2">
          <v-card-text>
            <v-row align="center">
              <v-col cols="12" sm="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Tìm kiếm sách"
                  variant="outlined"
                  clearable
                  hide-details
                />
              </v-col>

              <!-- Nút thêm sách -->
              <v-col cols="12" sm="6" md="3" class="d-flex justify-end align-center btn-add-unit">
                <v-btn color="primary" variant="outlined" @click="dialog = true">
                  <i class="fa-solid fa-plus mr-2"></i>
                  Thêm sách mới
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Unit Cards Grid -->
      <v-col
        v-for="(item, index) in filteredUnits"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card elevation="2" class="d-flex flex-column h-100 unit-card">
          <UnitCard
            :unit="item"
            @view="openUnitDetail"
            @edit="editUnit"
            @lesson="openLessonManagement"
            @delete="openDeleteConfirm"
          />
        </v-card>
      </v-col>

      <!-- Scroll to Top Button -->
      <v-btn
        v-if="showScrollToTop"
        class="scroll-to-top"
        color="primary"
        fab
        small
        @click="scrollToTop"
      >
        <i class="fa-solid fa-jet-fighter-up"></i>
      </v-btn>
    </v-row>
  </div>

  <!-- Quản lý các lesson > activity tương ứng của các lesson (chỉ hiển thị khi xem lesson) -->
  <div v-else>
    <div class="lesson-management-container" ref="lessonManagementContainer">
      <v-row>
        <v-col cols="12" md="12">
          <v-card class="pt-2 pb-2">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <h2 class="mb-1">{{ selectedUnit?.title }}</h2>
                <v-card-subtitle>
                  {{ selectedUnit?.description }}
                </v-card-subtitle>
              </div>
              <!-- Nút quay lại quản lý Unit đặt ở góc phải -->
              <v-btn color="primary" @click="backToUnitManagement" class="ml-3">
                <i class="fa-solid fa-arrow-left mr-2"></i>
                Quay lại
              </v-btn>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>

      <div class="panel-container">
        <!-- Left Panel: Lesson List -->
        <div class="panel-content lesson-panel">
          <div class="panel-header">
            <h3>Danh sách bài học</h3>
          </div>
          
          <div class="panel-body">
            <!-- Search và nút thêm bài học trên cùng một dòng -->
            <div class="search-add-container">
              <v-text-field
                v-model="searchLesson"
                label="Tìm kiếm bài học"
                prepend-inner-icon="fa-solid fa-search"
                variant="outlined"
                class="search-input"
                density="compact"
              ></v-text-field>
              
              <v-btn color="primary" @click="openFormAddLesson" title="Thêm bài học vào sách" class="ml-2">
                <i class="fa-solid fa-plus mr-1"></i> Thêm bài học
              </v-btn>
            </div>
        
            <!-- Danh sách bài học -->
            <!-- Loading -->
            <v-col v-if="loading" cols="12" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </v-col>
            
            <div class="lessons-container" v-else>
              <div v-if="lessonListByUnit.length === 0" class="empty-lessons">
                <i class="fa-solid fa-book-open"></i>
                <p>Chưa có bài học nào trong chương này</p>
              </div>
              
              <div v-else class="lesson-list">
                <div v-for="lesson in filteredLessonListByUnit" :key="lesson.id" class="lesson-item" :class="{ 'selected': selectedLessonId === lesson.id }" @click="viewListActivity(lesson.id)">
                  <div class="lesson-content">
                    <h4>{{ lesson.title }}</h4>
                    <p>{{ lesson.description }}</p>
                  </div>
                  <button 
                    class="delete-btn" 
                    @click.stop="confirmRemoveLesson(lesson)"
                    title="Xóa bài học"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>
                  <button 
                    class="edit-btn" 
                    @click.stop="editLesson(lesson)"
                    title="Sửa bài học"
                  >
                    <i class="fa-solid fa-edit"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Activity List -->
        <div v-if="showActivityPanel" class="panel-content activity-panel">
          <div class="panel-header">
            <h3>Danh sách hoạt động</h3>
            <button class="close-btn" @click="closeActivityPanel">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          
          <div class="panel-body">
            <!-- Search và nút thêm hoạt động trên cùng một dòng -->
            <div class="search-add-container">
              <v-text-field
                v-model="searchActivity"
                label="Tìm kiếm hoạt động"
                prepend-inner-icon="fa-solid fa-search"
                variant="outlined"
                class="search-input"
                density="compact"
              ></v-text-field>

              <v-btn 
                color="primary" 
                @click="openAddActivityDialog" 
                class="ml-2" 
                title="Thêm hoạt động mới cho bài học"
                :disabled="isAddActivityDisabled"
              >
                <i class="fa-solid fa-plus mr-1"></i> Thêm hoạt động
              </v-btn>
            </div>

            <!-- Danh sách hoạt động dạng card -->
            <div class="activities-container">
              <div v-if="activityList.length === 0" class="empty-activities">
                <i class="fa-solid fa-tasks"></i>
                <p>Chưa có hoạt động nào trong bài học này</p>
              </div>
              
              <div v-else class="activity-grid">
                <div v-for="activity in filteredActivityList" :key="activity.id" class="activity-card">
                  <div class="activity-image" v-if="activity.media_url">
                    <img :src="activity?.media_url || 'https://i.pinimg.com/736x/1d/f3/5a/1df35ae17bdcb3a2f63ddf137ebbd6b3.jpg'" :alt="activity.title" />
                  </div>
                  <div class="activity-image" v-else>
                  <img
                    :src="activity.media_url || 'https://i.pinimg.com/736x/1d/f3/5a/1df35ae17bdcb3a2f63ddf137ebbd6b3.jpg'"
                    :alt="activity.title || 'Image'"
                  />
                </div>

                  <div class="activity-content">
                    <h4>{{ activity.title }}</h4>
                    <p>{{ activity.instructions }}</p>
                  </div>
                  <div class="activity-actions">
                    <button
                      v-if="activity.type === 'conversation'"
                      @click="playAudio(activity)" 
                      title="Nghe âm thanh của hoạt động"
                      class="play-audio-btn"
                    >
                      <i class="fa-solid fa-circle-play"></i>
                    </button>
                    <button 
                      class="edit-btn" 
                      @click="editActivity(activity)"
                      title="Sửa hoạt động"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button 
                      class="delete-btn" 
                      @click="confirmRemoveActivity(activity)"
                      title="Xóa hoạt động"
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dialog thêm/sửa bài học -->
    <v-dialog v-model="addLessonDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">{{ isEditingLesson ? 'Sửa bài học' : 'Thêm bài học' }}</v-card-title>
        <v-card-text>
          <v-form ref="lessonForm">
            <v-text-field
              v-model="formAddLesson.title"
              label="Tiêu đề bài học"
              required
              class="mb-4"
            ></v-text-field>
            <v-select
              v-model="formAddLesson.type"
              :items="lessonTypes"
              item-title="label"
              item-value="value"
              label="Loại bài học"
              required
              class="mb-4"
              @update:model-value="handleLessonTypeChange"
            />
            <v-textarea
              v-model="formAddLesson.description"
              label="Mô tả bài học"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="addLessonDialog = false">Hủy</v-btn>
          <v-btn color="success" variant="text" @click="saveLesson">{{ isEditingLesson ? 'Cập nhật' : 'Thêm' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xác nhận xóa bài học -->
    <v-dialog v-model="deleteLessonDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa bài học "{{ selectedLesson?.title }}" khỏi chương?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="deleteLessonDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="text" @click="removeLesson">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog xác nhận xóa hoạt động -->
    <v-dialog v-model="deleteActivityDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
        <v-card-text>
          Bạn có chắc chắn muốn xóa hoạt động "{{ selectedActivity?.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="deleteActivityDialog = false">Hủy</v-btn>
          <v-btn color="error" variant="text" @click="removeActivity">Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog thêm/sửa hoạt động -->
    <v-dialog v-model="addActivityDialog" max-width="800px">
      <v-card>
        <v-card-title class="text-h6 title-detail">{{ isEditingActivity ? 'Sửa hoạt động' : 'Thêm hoạt động' }}</v-card-title>
        <v-card-text>
          <v-form ref="activityForm">
            <v-text-field
              v-model="formAddActivity.title"
              label="Tiêu đề hoạt động"
              required
              class="mb-4"
            ></v-text-field>
            
            <!-- Dropdown chọn type -->
            <v-select
              v-model="formAddActivity.type"
              :items="activityTypes"
              item-title="label"
              item-value="value"
              label="Loại hoạt động"
              required
              class="mb-4"
              @update:model-value="handleActivityTypeChange"
            />

            <v-textarea
              v-model="formAddActivity.instructions"
              label="Hướng dẫn"
              required
              class="mb-4"
            ></v-textarea>

            <!-- Hiển thị các field thông thường khi không phải conversation -->
            <div v-if="formAddActivity.type !== 'conversation'">
              <v-text-field
                v-model="formAddActivity.caculated_text"
                label="Nội dung tính toán"
                class="mb-4"
              ></v-text-field>
              
              <!-- Hiển thị ảnh cũ khi chỉnh sửa -->
              <div v-if="isEditingActivity && formAddActivity.media_url && typeof formAddActivity.media_url === 'string'" class="current-image">
                <p>Ảnh hiện tại:</p>
                <img :src="formAddActivity.media_url" alt="Ảnh của hoạt động" class="preview-image" />
              </div>

              <v-file-input
                v-model="activityMediaFile"
                label="Tệp media mới (jpeg, png, jpg, gif, webp)"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                prepend-icon=""
                class="mb-4"
                prepend-inner-icon="fa-solid fa-image"
              ></v-file-input>
            </div>

            <!-- Hiển thị conversation editor khi type là conversation -->
            <div v-if="formAddActivity.type === 'conversation'" class="conversation-editor">
              <h4 class="mb-3">Quản lý hội thoại</h4>
              
              <!-- Select option cho phương thức nhập liệu conversation -->
              <v-select
                v-model="conversationInputMethod"
                :items="conversationInputMethods"
                item-title="label"
                item-value="value"
                label="Phương thức nhập liệu"
                class="mb-4"
                @update:model-value="handleConversationInputMethodChange"
              ></v-select>

              <!-- Option 1: Text area nhập trực tiếp -->
              <div v-if="conversationInputMethod === 'text_area'" class="conversation-text-area">
                <v-textarea
                  v-model="conversationTextArea"
                  label="Nhập nội dung hội thoại"
                  hint="Định dạng: User: [nội dung] | Bot: [nội dung] | Mỗi cặp hội thoại trên một dòng"
                  persistent-hint
                  rows="10"
                  class="mb-2"
                  placeholder="User: Hi there!
Bot: Hello! How can I help you today?
User: Can you tell me the weather in London?
Bot: Sure! The weather in London is currently sunny with a temperature of 15°C."
                ></v-textarea>
                <v-btn color="primary" @click="parseConversationFromText" class="mb-4">
                  <i class="fa-solid fa-code mr-2"></i>
                  Parse từ text
                </v-btn>
              </div>

              <!-- Option 2: Nhập từng message (như cũ) -->
              <div v-if="conversationInputMethod === 'manual'" class="conversation-manual">
                <!-- Hiển thị danh sách messages -->
                <div class="conversation-messages mb-4">
                  <div 
                    v-for="(message, index) in formAddActivity.conversation_text" 
                    :key="index"
                    class="message-item"
                    :class="{'bot-message': message.speaker === 'bot', 'user-message': message.speaker === 'user'}"
                  >
                    <div class="message-bubble">
                      <span class="message-text">{{ message.text }}</span>
                      <button 
                        class="delete-message-btn" 
                        @click="removeConversationMessage(index)"
                        title="Xóa tin nhắn"
                      >
                        <i class="fa-solid fa-times"></i>
                      </button>
                    </div>
                    <span class="message-sender">{{ message.speaker === 'bot' ? 'Bot' : 'User' }}</span>
                  </div>
                  
                  <div v-if="formAddActivity.conversation_text.length === 0" class="no-messages">
                    <p>Chưa có tin nhắn nào trong hội thoại</p>
                  </div>
                </div>
                
                <!-- Form thêm message mới -->
                <div class="add-message-form">
                  <v-row align="center">
                    <v-col cols="12" sm="4">
                      <v-select
                        v-model="newMessage.speaker"
                        :items="speakerOptions"
                        label="Người gửi"
                        item-title="label"
                        item-value="value"
                        density="compact"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="newMessage.text"
                        label="Nội dung tin nhắn"
                        density="compact"
                        @keyup.enter="addConversationMessage"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="2" class="d-flex justify-end align-center">
                      <v-btn 
                        color="primary" 
                        @click="addConversationMessage"
                        :disabled="!newMessage.text.trim()"
                        class=""
                      >
                        <i class="fa-solid fa-plus"></i>
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
              </div>

              <!-- Option 3: Upload file txt -->
              <div v-if="conversationInputMethod === 'file_upload'" class="conversation-file-upload">
                <v-file-input
                  v-model="conversationFile"
                  label="Upload file hội thoại (.txt)"
                  accept=".txt"
                  prepend-inner-icon="fa-solid fa-file-upload"
                  class="mb-4"
                  @change="handleConversationFileUpload"
                ></v-file-input>
                
                <div v-if="conversationFileContent" class="file-preview">
                  <h5>Preview nội dung file:</h5>
                  <div class="preview-content">
                    <pre>{{ conversationFileContent }}</pre>
                  </div>
                  <v-btn color="primary" @click="parseConversationFromFile" class="mt-2">
                    <i class="fa-solid fa-code mr-2"></i>
                    Parse từ file
                  </v-btn>
                </div>
              </div>

              <!-- Preview conversation đã parse -->
              <div v-if="formAddActivity.conversation_text.length > 0" class="conversation-preview mt-4">
                <h5>Preview hội thoại:</h5>
                <div class="preview-messages">
                  <div 
                    v-for="(message, index) in formAddActivity.conversation_text" 
                    :key="index"
                    class="preview-message"
                    :class="{'bot-preview': message.speaker === 'bot', 'user-preview': message.speaker === 'user'}"
                  >
                    <strong>{{ message.speaker === 'bot' ? 'Bot' : 'User' }}:</strong> {{ message.text }}
                  </div>
                </div>
                <p class="text-caption mt-2">Tổng số tin nhắn: {{ formAddActivity.conversation_text.length }}</p>
              </div>
            </div>

            <v-text-field
              v-model.number="formAddActivity.position"
              label="Vị trí"
              type="number"
              class="mt-4"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="addActivityDialog = false">Hủy</v-btn>
          <v-btn color="success" variant="text" class="update-btn" @click="saveActivity">{{ isEditingActivity ? 'Cập nhật' : 'Thêm' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

  <!-- Dialog tạo sách -->
  <UnitCreateDialog v-model:dialog="dialog" @created="fetchUnits" />
  <!-- Dialog chỉnh sửa sách -->
  <UnitEditDialog
    v-model:dialog="editDialog"
    :unit="selectedUnit"
    @updated="fetchUnits"
  />
  

  <UnitDetail
    v-model:dialog="detailDialog"
    :unit="selectedUnit"
    :types="types"
  />
  <!-- Dialog hiện các audio của activityđể nghe -->
   <v-dialog v-model="audioDialog" max-width="700px">
    <v-card>
      <v-card-title class="text-h5 title-detail-unit">
        <i class="fa-solid fa-music mr-2"></i>
        Âm thanh của hoạt động: {{ selectedActivity?.title }}
      </v-card-title>
      <v-card-text>
        <div class="audio-list">
          <div v-if="selectedActivity?.audios && selectedActivity.audios.length > 0">
            <p class="mb-4"><strong>Tổng số audio:</strong> {{ selectedActivity.audios.length }}</p>
            
            <!-- Hiển thị conversation text nếu activity có conversation_text -->
            <div v-if="selectedActivity.type === 'conversation' && conversationTexts.length > 0" class="conversation-preview mb-4">
              <h4 class="mb-2">Nội dung hội thoại:</h4>
              <div class="conversation-text">
                <div 
                  v-for="(text, index) in conversationTexts" 
                  :key="index"
                  class="conversation-line"
                  :class="{'highlighted': isCurrentAudioText(index)}"
                >
                  <span class="speaker-tag">{{ text.speaker === 'bot' ? 'Bot' : 'User' }}:</span>
                  <span class="text-content">{{ text.text }}</span>
                  <span v-if="isCurrentAudioText(index)" class="playing-indicator">
                    <i class="fa-solid fa-volume-up ml-2"></i>
                  </span>
                </div>
              </div>
            </div>
            
            <div v-for="(audio, index) in selectedActivity.audios" :key="audio.id" class="audio-item mb-4">
              <div class="audio-info">
                <div class="audio-header">
                  <strong>Audio {{ index + 1 }}</strong>
                  <span v-if="audio.speaker" class="speaker-badge">
                    Speaker: {{ audio.speaker }}
                  </span>
                  <span v-if="audio.index_in_conversation !== null" class="index-badge">
                    Vị trí: {{ audio.index_in_conversation }}
                  </span>
                </div>

                <!-- Hiển thị text tương ứng với audio -->
                <div v-if="getAudioText(audio)" class="audio-text mb-2">
                  <strong>Nội dung:</strong> 
                  <span class="text-content" :class="{'highlighted-text': audioPlayingStates[audio.id]}">
                    "{{ getAudioText(audio) }}"
                  </span>
                </div>
                
                <div class="audio-controls">
                  <audio 
                    :ref="el => setAudioRef(audio.id, el)"
                    :src="audio.audio_url" 
                    preload="metadata"
                    class="audio-player"
                    @loadedmetadata="onAudioLoaded(audio.id)"
                    @timeupdate="onAudioTimeUpdate(audio.id)"
                    @ended="onAudioEnded(audio.id)"
                    @loadstart="onAudioLoadStart(audio.id)"
                    @canplay="onAudioCanPlay(audio.id)"
                  ></audio>
                  
                  <v-btn 
                    color="primary" 
                    @click="toggleAudio(audio.id)"
                    :loading="audioLoadingStates[audio.id]"
                    class="play-btn"
                    :class="{'playing': audioPlayingStates[audio.id]}"
                  >
                    <i class="fa-solid mr-2" :class="audioPlayingStates[audio.id] ? 'fa-pause' : 'fa-play'"></i>
                    {{ audioPlayingStates[audio.id] ? 'Dừng' : 'Phát' }}
                  </v-btn>
                  
                  <span class="audio-duration ml-2">
                    {{ getAudioDuration(audio.id) }}
                  </span>
                </div>
                
                <div class="audio-progress mt-2" v-if="audioDurations[audio.id]">
                  <v-progress-linear
                    :model-value="audioProgress[audio.id] || 0"
                    color="primary"
                    height="6"
                    rounded
                  ></v-progress-linear>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="no-audio">
            <i class="fa-solid fa-volume-mute fa-2x mb-3"></i>
            <p>Không có audio nào cho hoạt động này</p>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="closeAudioDialog">
          <i class="fa-solid fa-times mr-2"></i>
          Đóng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xem chi tiết -->
  <v-dialog v-model="detailDialog" max-width="600px">
    <v-card>
      <v-card-title class="text-h5 title-detail-unit">{{ selectedUnit?.title }}</v-card-title>
      <v-card-text>
        <v-img
          :src="formatURLImage(selectedUnit?.cover)"
          :alt="selectedUnit?.title"
          height="200"
          class="mb-4"
        />
        <p><strong>Mô tả:</strong> {{ selectedUnit?.description }}</p>
        <p><strong>Thời gian:</strong> {{ selectedUnit?.limit_time }} phút</p>
        <p><strong>Độ khó:</strong> {{ selectedUnit?.level }}</p>
        <p><strong>Đăng bởi:</strong> {{ selectedUnit?.upload_by === 'teacher' ? 'Giáo viên' : 'Hệ thống' }}</p>
        <p><strong>Ngày tạo:</strong> {{ new Date(selectedUnit?.created_at).toLocaleDateString() }}</p>
        <p><strong>Ngày cập nhật:</strong> {{ new Date(selectedUnit?.updated_at).toLocaleDateString() }}</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="detailDialog = false">Đóng</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Dialog xác nhận xóa -->
  <v-dialog v-model="deleteDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6">Xác nhận xóa</v-card-title>
      <v-card-text>
        Bạn có chắc chắn muốn xóa sách "{{ selectedUnit?.title }}"?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="text" @click="deleteDialog = false">Hủy</v-btn>
        <v-btn color="error" variant="text" @click="confirmDelete">Xóa</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  createActivityApi,
  deleteActivityApi,
  listActivityApi,
  updateActivityApi
} from '@/apis/modules/activity.api'

import { createLessonApi, deleteLessonApi, listLessonApi, listLessonByIdUnitApi, updateLessonApi } from '@/apis/modules/lesson.api'
import { deleteUnitApi, listUnitApi } from '@/apis/modules/unit.api'
import UnitCreateDialog from '@/pages/unit/UnitCreate.vue'
import UnitDetail from '@/pages/unit/UnitDetail.vue'
import UnitEditDialog from '@/pages/unit/UnitEdit.vue'
import UnitCard from '@/pages/unit/components/UnitCard.vue'
import { useToast } from '@/stores/toast.store'
import { formatURLImage } from '@/utils/format.util'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const loading = ref(false)

const units = ref([])
const lessons = ref([])
const searchQuery = ref('')
const selectedType = ref(null)
const selectedLevel = ref(null)
const dialog = ref(false)
const editDialog = ref(false)
const detailDialog = ref(false)
const deleteDialog = ref(false)
const lessonListVisible = ref(false)
const selectedUnit = ref(null)
const toast = useToast()
const isToolbarHidden = ref(false)
const showScrollToTop = ref(false)
const lastScrollPosition = ref(0)

const audioDialog = ref(false)
const audioPlayingStates = ref({})
const audioLoadingStates = ref({})
const audioDurations = ref({})
const audioProgress = ref({})
const audioElements = ref({})

const deleteLessonDialog = ref(false)
const selectedLesson = ref(null)
const lessonListByUnit = ref([])
const lessonList = ref([])
const showActivityPanel = ref(false)
const selectedLessonId = ref(null)
const activityList = ref([])
const searchLesson = ref('')
const searchActivity = ref('')
const deleteActivityDialog = ref(false)
const selectedActivity = ref(null)
const addActivityDialog = ref(false)
const isEditingActivity = ref(false)
const showLessonManagement = ref(false)
const addLessonDialog = ref(false)
const isEditingLesson = ref(false)
const lessonManagementContainer = ref(null)
const activityMediaFile = ref(null)

const conversationInputMethod = ref('manual') // 'manual', 'text_area', 'file_upload'
const conversationTextArea = ref('')
const conversationFile = ref(null)
const conversationFileContent = ref('')

const activityTypes = [
  { value: 'word', label: 'Word - Từ vựng' },
  { value: 'phrase', label: 'Phrase - Cụm từ' },
  { value: 'conversation', label: 'Conversation - Cuộc hội thoại' },
  { value: 'sentence', label: 'Sentences - Câu' }
]

const speakerOptions = [
  { value: 'bot', label: 'Bot' },
  { value: 'user', label: 'User' }
]

const lessonTypes = [
  { value: 'conversation', label: 'Conversation - Cuộc hội thoại' },
  { value: 'speaking', label: 'Speaking - Nói' }
]

const newMessage = ref({
  speaker: 'bot',
  text: ''
})

const conversationInputMethods = [
  { value: 'manual', label: 'Nhập từng message (mặc định)' },
  { value: 'text_area', label: 'Text area - Nhập toàn bộ' },
  { value: 'file_upload', label: 'Upload file (.txt)' }
]

const filteredUnits = computed(() => {
  return units.value.filter((unit) => {
    const query = (searchQuery.value || '').toLowerCase()
    const matchesSearch =
      unit.title.toLowerCase().includes(query) ||
      (unit.description && unit.description.toLowerCase().includes(query))
    const matchesType = !selectedType.value || unit.type === selectedType.value
    const matchesLevel = !selectedLevel.value || unit.level === selectedLevel.value
    return matchesSearch && matchesType && matchesLevel
  })
})

const filteredLessonListByUnit = computed(() => {
  if (!searchLesson.value) return lessonListByUnit.value
  return lessonListByUnit.value.filter(lesson =>
    lesson.title.toLowerCase().includes(searchLesson.value.toLowerCase()) ||
    (lesson.description && lesson.description.toLowerCase().includes(searchLesson.value.toLowerCase()))
  )
})

const filteredActivityList = computed(() => {
  if (!searchActivity.value) return activityList.value
  return activityList.value.filter(activity =>
    activity.title.toLowerCase().includes(searchActivity.value.toLowerCase()) ||
    (activity.instructions && activity.instructions.toLowerCase().includes(searchActivity.value.toLowerCase()))
  )
})

const isAddActivityDisabled = computed(() => {
  if (selectedLessonId.value) {
    const selectedLesson = lessonListByUnit.value.find(lesson => lesson.id === selectedLessonId.value)
    if (selectedLesson && selectedLesson.type === 'conversation') {
      return activityList.value.some(activity => activity.type === 'conversation')
    }
  }
  return false
})

const formAddLesson = ref({
  title: '',
  description: '',
  unit_id: '',
  type: 'conversation'
})

const formAddActivity = ref({
  lesson_id: '',
  title: '',
  type: 'word',
  instructions: '',
  caculated_text: '',
  media_url: null,
  position: 0,
  conversation_text: []
})

const fetchUnits = async () => {
  loading.value = true
  try {
    const response = await listUnitApi()
    units.value = response.data.data.map((unit) => ({
      ...unit,
      category: unit.type,
    }))
  } catch (error) {
    console.error('Error fetching units:', error)
  }
  finally {
    loading.value = false
  }
}

const openUnitDetail = (unit) => {
  selectedUnit.value = { ...unit }
  detailDialog.value = true
}

const openLessonManagement = async (unit) => {
  selectedUnit.value = { ...unit }
  showLessonManagement.value = true
  await fetchLessons(unit.id)
  
  // Tự động cuộn xuống một chút sau khi hiển thị
  nextTick(() => {
    if (lessonManagementContainer.value) {
      window.scrollTo({
        top: lessonManagementContainer.value.offsetTop + 5,
        behavior: 'smooth'
      })
    }
  })
}

const backToUnitManagement = () => {
  showLessonManagement.value = false
  selectedUnit.value = null
  showActivityPanel.value = false
  selectedLessonId.value = null
}

const openDeleteConfirm = (unit) => {
  selectedUnit.value = { ...unit }
  deleteDialog.value = true
}

const confirmDelete = async () => {
  try {
    await deleteUnitApi({ unit_id: selectedUnit.value.id })
    units.value = units.value.filter((unit) => unit.id !== selectedUnit.value.id)
    deleteDialog.value = false
    setTimeout(() => {
      selectedUnit.value = null
    }, 300)
    toast.show('Xóa sách thành công!', 'success')
  } catch (error) {
    console.error('Error deleting unit:', error)
  }
}

const editUnit = (unit) => {
  selectedUnit.value = { ...unit }
  editDialog.value = true
}

// Reset selectedUnit khi các dialog đóng
watch([editDialog, detailDialog, deleteDialog, lessonListVisible], ([edit, detail, del, lessonList]) => {
  if (!edit && !detail && !del && !lessonList) {
    setTimeout(() => {
      selectedUnit.value = null
    }, 300)
  }
})

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset
  const isMobileOrTablet = window.innerWidth <= 1024

  // Handle toolbar visibility
  if (isMobileOrTablet) {
    if (currentScrollPosition > lastScrollPosition.value && currentScrollPosition > 100) {
      isToolbarHidden.value = true
    } else {
      isToolbarHidden.value = false
    }
  }

  // Handle scroll-to-top button visibility
  showScrollToTop.value = currentScrollPosition > 300

  lastScrollPosition.value = currentScrollPosition
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const closePanel = () => {
  showActivityPanel.value = false
  selectedLessonId.value = null
}

const closeActivityPanel = () => {
  showActivityPanel.value = false
  selectedLessonId.value = null
}

const openFormAddLesson = () => {
  isEditingLesson.value = false
  formAddLesson.value = {
    title: '',
    description: '',
    type: '',
    unit_id: selectedUnit.value.id
  }
  addLessonDialog.value = true
}

const editLesson = (lesson) => {
  isEditingLesson.value = true
  selectedLesson.value = lesson
  formAddLesson.value = { ...lesson }
  addLessonDialog.value = true
}

const handleLessonTypeChange = async (newType) => {
  if (isEditingLesson.value && newType !== selectedLesson.value.type) {
    try {
      const response = await listActivityApi(selectedLesson.value.id)
      const activities = response.data.data
      if (activities.length > 0) {
        toast.show('Không thể thay đổi loại bài học vì đã có hoạt động liên quan.', 'error')
        formAddLesson.value.type = selectedLesson.value.type
      }
    } catch (error) {
      console.error('Error checking activities:', error)
      toast.show('Không thể kiểm tra hoạt động.', 'error')
    }
  }
}

const saveLesson = async () => {
  try {
    if (isEditingLesson.value) {
      // Cập nhật bài học
      const updateData = {
        title: formAddLesson.value.title,
        description: formAddLesson.value.description,
        unit_id: selectedUnit.value.id,
        lesson_id: selectedLesson.value.id,
        type: formAddLesson.value.type
      }
      await updateLessonApi(updateData)
      
      // Cập nhật danh sách hiển thị
      const index = lessonListByUnit.value.findIndex(l => l.id === selectedLesson.value.id)
      if (index !== -1) {
        lessonListByUnit.value[index] = { 
          ...lessonListByUnit.value[index], 
          title: formAddLesson.value.title,
          description: formAddLesson.value.description,
          type: formAddLesson.value.type
        }
      }
      toast.show('Cập nhật bài học thành công', 'success')
    } else {
      // Tạo bài học mới
      const createData = {
        title: formAddLesson.value.title,
        description: formAddLesson.value.description,
        unit_id: selectedUnit.value.id,
        type: formAddLesson.value.type
      }
      const response = await createLessonApi(createData)
      lessonListByUnit.value.push(response.data.data)
      toast.show('Thêm bài học thành công', 'success')
    }
    addLessonDialog.value = false
  } catch (error) {
    console.error('Error saving lesson:', error)
    toast.show('Không thể lưu bài học', 'error')
  }
}

const confirmRemoveLesson = (lesson) => {
  selectedLesson.value = lesson
  deleteLessonDialog.value = true
}

const removeLesson = async () => {
  if (selectedLesson.value) {
    try {
      await deleteLessonApi({ lesson_id: selectedLesson.value.id })
      lessonListByUnit.value = lessonListByUnit.value.filter(
        lesson => lesson.id !== selectedLesson.value.id
      )
      toast.show('Xóa bài học thành công', 'success')
    } catch (error) {
      console.error('Error deleting lesson:', error)
      toast.show('Không thể xóa bài học', 'error')
    }
    deleteLessonDialog.value = false
    selectedLesson.value = null
  }
}

const viewListActivity = async (lessonId) => {
  selectedLessonId.value = lessonId
  showActivityPanel.value = true
  try {
    const response = await listActivityApi(lessonId)
    activityList.value = response.data.data
  } catch (error) {
    console.error('Error fetching activities:', error)
    toast.show('Không thể tải danh sách hoạt động', 'error')
  }
}

const openAddActivityDialog = () => {
  isEditingActivity.value = false
  activityMediaFile.value = null
  formAddActivity.value = {
    lesson_id: selectedLessonId.value,
    title: '',
    instructions: '',
    caculated_text: '',
    media_url: null,
    position: activityList.value.length,
    type: 'word',
    conversation_text: []
  }
  newMessage.value = {
    speaker: 'bot',
    text: ''
  }
  addActivityDialog.value = true
}

const editActivity = (activity) => {
  isEditingActivity.value = true
  selectedActivity.value = activity
  activityMediaFile.value = null
  
  // Parse conversation_text nếu có
  let conversationText = []
  if (activity.conversation_text) {
    if (typeof activity.conversation_text === 'string') {
      try {
        conversationText = JSON.parse(activity.conversation_text)
      } catch (e) {
        console.error('Error parsing conversation_text:', e)
        conversationText = []
      }
    } else if (Array.isArray(activity.conversation_text)) {
      conversationText = activity.conversation_text
    }
  }
  
  formAddActivity.value = { 
    ...activity, 
    lesson_id: selectedLessonId.value,
    conversation_text: conversationText,
    instructions: activity.instructions || ''
  }
  
  newMessage.value = {
    speaker: 'bot',
    text: ''
  }
  addActivityDialog.value = true
}

const confirmRemoveActivity = (activity) => {
  selectedActivity.value = activity
  deleteActivityDialog.value = true
}

const removeActivity = async () => {
  if (selectedActivity.value) {
    try {
      await deleteActivityApi({ activity_id: selectedActivity.value.id })
      activityList.value = activityList.value.filter(
        activity => activity.id !== selectedActivity.value.id
      )
      toast.show('Xóa hoạt động thành công', 'success')
    } catch (error) {
      console.error('Error deleting activity:', error)
      toast.show('Không thể xóa hoạt động', "error")
    }
    deleteActivityDialog.value = false
    selectedActivity.value = null
  }
}

// const saveActivity = async () => {
//   try {
//     // Kiểm tra nếu lesson type là conversation và đã có activity conversation
//     if (!isEditingActivity.value) {
//       const selectedLesson = lessonListByUnit.value.find(lesson => lesson.id === selectedLessonId.value)
//       if (selectedLesson?.type === 'conversation' && formAddActivity.value.type === 'conversation') {
//         const hasConversation = activityList.value.some(activity => activity.type === 'conversation')
//         if (hasConversation) {
//           toast.show('Chỉ được tạo một hoạt động conversation cho bài học này', 'error')
//           return
//         }
//       }
//     }

//     // Chuẩn bị dữ liệu conversation_text
//     let conversationTextData = ''
//     if (formAddActivity.value.type === 'conversation') {
//       conversationTextData = JSON.stringify(formAddActivity.value.conversation_text)
//     }

//     if (isEditingActivity.value) {
//       // Tạo FormData để xử lý upload file
//       const formData = new FormData()
//       formData.append('title', formAddActivity.value.title)
//       formData.append('type', formAddActivity.value.type)
//       formData.append('instructions', formAddActivity.value.instructions)

//       // Chỉ thêm các field này nếu không phải conversation
//       if (formAddActivity.value.type !== 'conversation') {
//         formData.append('caculated_text', formAddActivity.value.caculated_text || '')
//       } else {
//         // Thêm conversation_text cho type conversation
//         formData.append('conversation_text', conversationTextData)
//       }

//       formData.append('position', formAddActivity.value.position.toString())
//       formData.append('lesson_id', selectedLessonId.value)
//       formData.append('activity_id', selectedActivity.value.id)

//       // Thêm file media nếu có và không phải conversation
//       if (activityMediaFile.value && formAddActivity.value.type !== 'conversation') {
//         formData.append('media_url', activityMediaFile.value)
//       }

//       // Cập nhật hoạt động
//       await updateActivityApi(formData)

//       // Cập nhật danh sách hiển thị
//       activityList.value = activityList.value.map(activity =>
//         activity.id === selectedActivity.value.id ? { 
//           ...activity, 
//           title: formAddActivity.value.title,
//           type: formAddActivity.value.type,
//           instructions: formAddActivity.value.instructions,
//           caculated_text: formAddActivity.value.caculated_text,
//           conversation_text: formAddActivity.value.conversation_text,
//           position: formAddActivity.value.position
//         } : activity
//       )

//       toast.show('Cập nhật hoạt động thành công', 'success')
//     } else {
//       // Tạo FormData để xử lý upload file
//       const formData = new FormData()
//       formData.append('title', formAddActivity.value.title)
//       formData.append('type', formAddActivity.value.type)

//       // Chỉ thêm các field này nếu không phải conversation
//       if (formAddActivity.value.type !== 'conversation') {
//         formData.append('instructions', formAddActivity.value.instructions)
//         formData.append('caculated_text', formAddActivity.value.caculated_text || '')
//       } else {
//         // Thêm conversation_text cho type conversation
//         formData.append('conversation_text', conversationTextData)
//       }

//       formData.append('position', formAddActivity.value.position.toString())
//       formData.append('lesson_id', selectedLessonId.value)

//       // Thêm file media nếu có và không phải conversation
//       if (activityMediaFile.value && formAddActivity.value.type !== 'conversation') {
//         formData.append('media_url', activityMediaFile.value)
//       }

//       // Tạo hoạt động mới
//       const response = await createActivityApi(formData)
//       activityList.value.push(response.data.data)
//       toast.show('Thêm hoạt động thành công', 'success')
//     }
//     addActivityDialog.value = false
//   } catch (error) {
//     console.error('Error saving activity:', error)
//     toast.show('Không thể lưu hoạt động', 'error')
//   }
// }

// Sửa hàm saveActivity để đảm bảo conversation_text được format đúng
const saveActivity = async () => {
  try {
    // Kiểm tra nếu lesson type là conversation và đã có activity conversation
    if (!isEditingActivity.value) {
      const selectedLesson = lessonListByUnit.value.find(lesson => lesson.id === selectedLessonId.value)
      if (selectedLesson?.type === 'conversation' && formAddActivity.value.type === 'conversation') {
        const hasConversation = activityList.value.some(activity => activity.type === 'conversation')
        if (hasConversation) {
          toast.show('Chỉ được tạo một hoạt động conversation cho bài học này', 'error')
          return
        }
      }
    }

    // Validate conversation data
    if (formAddActivity.value.type === 'conversation') {
      if (!formAddActivity.value.conversation_text || formAddActivity.value.conversation_text.length === 0) {
        toast.show('Vui lòng thêm ít nhất một tin nhắn cho hội thoại', 'error')
        return
      }
    }

    // Chuẩn bị dữ liệu conversation_text
    let conversationTextData = ''
    if (formAddActivity.value.type === 'conversation') {
      conversationTextData = JSON.stringify(formAddActivity.value.conversation_text)
    }

    if (isEditingActivity.value) {
      // Tạo FormData để xử lý upload file
      const formData = new FormData()
      formData.append('title', formAddActivity.value.title)
      formData.append('type', formAddActivity.value.type)
      formData.append('instructions', formAddActivity.value.instructions)
      
      // Chỉ thêm các field này nếu không phải conversation
      if (formAddActivity.value.type !== 'conversation') {
        formData.append('caculated_text', formAddActivity.value.caculated_text || '')
      } else {
        // Thêm conversation_text cho type conversation
        formData.append('conversation_text', conversationTextData)
      }
      
      formData.append('position', formAddActivity.value.position.toString())
      formData.append('lesson_id', selectedLessonId.value)
      formData.append('activity_id', selectedActivity.value.id)
      
      // Thêm file media nếu có và không phải conversation
      if (activityMediaFile.value && formAddActivity.value.type !== 'conversation') {
        formData.append('media_url', activityMediaFile.value)
      }
      
      // Cập nhật hoạt động
      await updateActivityApi(formData)
      
      // Cập nhật danh sách hiển thị
      activityList.value = activityList.value.map(activity =>
        activity.id === selectedActivity.value.id ? { 
          ...activity, 
          title: formAddActivity.value.title,
          type: formAddActivity.value.type,
          instructions: formAddActivity.value.instructions,
          caculated_text: formAddActivity.value.caculated_text,
          conversation_text: formAddActivity.value.conversation_text,
          position: formAddActivity.value.position
        } : activity
      )
      
      toast.show('Cập nhật hoạt động thành công', 'success')
    } else {
      // Tạo FormData để xử lý upload file
      const formData = new FormData()
      formData.append('title', formAddActivity.value.title)
      formData.append('type', formAddActivity.value.type)
      
      // Chỉ thêm các field này nếu không phải conversation
      if (formAddActivity.value.type !== 'conversation') {
        formData.append('instructions', formAddActivity.value.instructions)
        formData.append('caculated_text', formAddActivity.value.caculated_text || '')
      } else {
        // Thêm conversation_text cho type conversation
        formData.append('conversation_text', conversationTextData)
      }
      
      formData.append('position', formAddActivity.value.position.toString())
      formData.append('lesson_id', selectedLessonId.value)
      
      // Thêm file media nếu có và không phải conversation
      if (activityMediaFile.value && formAddActivity.value.type !== 'conversation') {
        formData.append('media_url', activityMediaFile.value)
      }
      
      // Tạo hoạt động mới
      const response = await createActivityApi(formData)
      activityList.value.push(response.data.data)
      toast.show('Thêm hoạt động thành công', 'success')
    }
    addActivityDialog.value = false
  } catch (error) {
    console.error('Error saving activity:', error)
    toast.show('Không thể lưu hoạt động', 'error')
  }
}

// Hàm xử lý khi chọn file ảnh mới
const handleMediaFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    activityMediaFile.value = file
    // Hiển thị preview ảnh nếu cần
    const reader = new FileReader()
    reader.onload = (e) => {
      formAddActivity.value.media_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Hàm xử lý khi thay đổi loại activity
// const handleActivityTypeChange = (newType) => {
//   if (newType === 'conversation') {
//     // Reset các field không cần thiết cho conversation
//     formAddActivity.value.instructions = ''
//     formAddActivity.value.caculated_text = ''
//     formAddActivity.value.media_url = null
//     activityMediaFile.value = null

//     // Khởi tạo conversation_text nếu chưa có
//     if (!formAddActivity.value.conversation_text) {
//       formAddActivity.value.conversation_text = []
//     }
//   }
// }

// Hàm xử lý khi thay đổi loại activity
const handleActivityTypeChange = (newType) => {
  if (newType === 'conversation') {
    // Reset các field không cần thiết cho conversation
    formAddActivity.value.instructions = ''
    formAddActivity.value.caculated_text = ''
    formAddActivity.value.media_url = null
    activityMediaFile.value = null
    
    // Khởi tạo conversation_text nếu chưa có
    if (!formAddActivity.value.conversation_text) {
      formAddActivity.value.conversation_text = []
    }
    
    // Reset phương thức nhập liệu về manual
    conversationInputMethod.value = 'manual'
    conversationTextArea.value = ''
    conversationFile.value = null
    conversationFileContent.value = ''
  } else {
    // Reset conversation data khi chuyển sang type khác
    formAddActivity.value.conversation_text = []
  }
}

// Hàm thêm message vào conversation (cho phương thức manual)
const addConversationMessage = () => {
  if (newMessage.value.text.trim()) {
    formAddActivity.value.conversation_text.push({
      speaker: newMessage.value.speaker,
      text: newMessage.value.text.trim()
    })
    newMessage.value.text = ''
  }
}


// Hàm xóa message khỏi conversation
const removeConversationMessage = (index) => {
  formAddActivity.value.conversation_text.splice(index, 1)
}

const fetchLessons = async (unitId) => {
  try {
    const response = await listLessonByIdUnitApi(unitId)
    lessonListByUnit.value = response.data.data.map((lesson) => ({
      ...lesson,
      category: lesson.type,
    }))
  } catch (error) {
    console.error('Error fetching lessons:', error)
    toast.show('Không thể tải danh sách bài học', "error")
  }
}

const fetchListLessons = async () => {
  try {
    const response = await listLessonApi()
    lessonList.value = response.data.data
  } catch (error) {
    console.error('Error fetching lessons:', error)
    toast.show('Không thể tải danh sách bài học', "error")
  }
}

const setAudioRef = (audioId, el) => {
  if (el) {
    audioElements.value[audioId] = el
  }
}

// Hàm lấy audio element theo id
const getAudioElement = (audioId) => {
  return audioElements.value[audioId]
}

// Các event handlers cho audio
const onAudioLoaded = (audioId) => {
  const audioElement = getAudioElement(audioId)
  if (audioElement) {
    audioDurations.value[audioId] = formatTime(audioElement.duration)
  }
}

const onAudioTimeUpdate = (audioId) => {
  const audioElement = getAudioElement(audioId)
  if (audioElement && audioElement.duration) {
    const progress = (audioElement.currentTime / audioElement.duration) * 100
    audioProgress.value[audioId] = progress
  }
}

const onAudioEnded = (audioId) => {
  audioPlayingStates.value[audioId] = false
  audioProgress.value[audioId] = 0
}

const onAudioLoadStart = (audioId) => {
  audioLoadingStates.value[audioId] = true
}

const onAudioCanPlay = (audioId) => {
  audioLoadingStates.value[audioId] = false
}

// Hàm mở dialog audio
const playAudio = (activity) => {
  selectedActivity.value = activity
  audioDialog.value = true
  
  // Reset trạng thái audio khi mở dialog
  nextTick(() => {
    if (selectedActivity.value?.audios) {
      selectedActivity.value.audios.forEach(audio => {
        audioPlayingStates.value[audio.id] = false
        audioLoadingStates.value[audio.id] = false
        audioProgress.value[audio.id] = 0
        audioDurations.value[audio.id] = null
        
        const audioElement = getAudioElement(audio.id)
        if (audioElement) {
          audioElement.currentTime = 0
        }
      })
    }
  })
}

// Hàm đóng dialog audio
const closeAudioDialog = () => {
  // Dừng tất cả audio đang phát
  if (selectedActivity.value?.audios) {
    selectedActivity.value.audios.forEach(audio => {
      const audioElement = getAudioElement(audio.id)
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
      audioPlayingStates.value[audio.id] = false
      audioProgress.value[audio.id] = 0
    })
  }
  audioElements.value = {}
  audioDialog.value = false
}

// Hàm play/pause audio
const toggleAudio = async (audioId) => {
  const audioElement = getAudioElement(audioId)
  if (!audioElement) {
    console.error(`Audio element not found for id: ${audioId}`)
    return
  }

  if (selectedActivity.value?.audios) {
    selectedActivity.value.audios.forEach(audio => {
      if (audio.id !== audioId && audioPlayingStates.value[audio.id]) {
        const otherAudioElement = getAudioElement(audio.id)
        if (otherAudioElement) {
          otherAudioElement.pause()
          otherAudioElement.currentTime = 0
          audioPlayingStates.value[audio.id] = false
          audioProgress.value[audio.id] = 0
        }
      }
    })
  }

  if (audioPlayingStates.value[audioId]) {
    // Đang phát -> dừng
    audioElement.pause()
    audioPlayingStates.value[audioId] = false
    console.log(`Audio ${audioId} paused`)
  } else {
    // Đang dừng -> phát
    try {
      audioLoadingStates.value[audioId] = true
      await audioElement.play()
      audioPlayingStates.value[audioId] = true
      audioLoadingStates.value[audioId] = false
      // console.log(`Audio ${audioId} playing successfully`)
    } catch (error) {
      console.error('Lỗi phát audio:', error)
      audioLoadingStates.value[audioId] = false
      audioPlayingStates.value[audioId] = false
      
      // Hiển thị thông báo lỗi cho user
      toast.show('Không thể phát audio. Vui lòng thử lại.', 'error')
    }
  }
}

// Lấy thời lượng audio
const getAudioDuration = (audioId) => {
  return audioDurations.value[audioId] || '--:--'
}

// Format thời gian
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Thêm computed property để parse conversation_text
const conversationTexts = computed(() => {
  if (!selectedActivity.value?.conversation_text) return []
  
  try {
    // Nếu conversation_text là string, parse nó
    if (typeof selectedActivity.value.conversation_text === 'string') {
      return JSON.parse(selectedActivity.value.conversation_text)
    }
    // Nếu đã là array, trả về trực tiếp
    return selectedActivity.value.conversation_text
  } catch (error) {
    console.error('Error parsing conversation_text:', error)
    return []
  }
})

// Hàm lấy text tương ứng với audio
const getAudioText = (audio) => {
  if (audio.index_in_conversation === null || audio.index_in_conversation === undefined) {
    return null
  }
  
  // Đảm bảo index_in_conversation là số và nằm trong khoảng hợp lệ
  const index = parseInt(audio.index_in_conversation)
  if (isNaN(index) || index < 0 || index >= conversationTexts.value.length) {
    return null
  }
  
  return conversationTexts.value[index]?.text || null
}

// Hàm kiểm tra xem text có đang được phát không
const isCurrentAudioText = (index) => {
  if (!selectedActivity.value?.audios) return false
  
  const audio = selectedActivity.value.audios.find(a => 
    parseInt(a.index_in_conversation) === index && 
    audioPlayingStates.value[a.id]
  )
  
  return !!audio
}


// Hàm xử lý khi thay đổi phương thức nhập liệu conversation
const handleConversationInputMethodChange = (method) => {
  conversationInputMethod.value = method
  // Reset các giá trị khi chuyển phương thức
  if (method === 'text_area') {
    conversationTextArea.value = convertConversationToText(formAddActivity.value.conversation_text)
  } else if (method === 'file_upload') {
    conversationFile.value = null
    conversationFileContent.value = ''
  }
}

// Hàm chuyển đổi conversation array sang text
const convertConversationToText = (conversationArray) => {
  if (!conversationArray || !Array.isArray(conversationArray)) return ''
  
  return conversationArray.map(message => {
    const speaker = message.speaker === 'bot' ? 'Bot' : 'User'
    return `${speaker}: ${message.text}`
  }).join('\n')
}

// Hàm parse conversation từ text area
const parseConversationFromText = () => {
  if (!conversationTextArea.value.trim()) {
    toast.show('Vui lòng nhập nội dung hội thoại', 'error')
    return
  }

  try {
    const parsedConversation = parseConversationText(conversationTextArea.value)
    
    if (parsedConversation.length === 0) {
      toast.show('Không tìm thấy hội thoại hợp lệ. Định dạng: "User: text" hoặc "Bot: text"', 'error')
      return
    }
    
    formAddActivity.value.conversation_text = parsedConversation
    toast.show(`Đã parse thành công ${parsedConversation.length} tin nhắn`, 'success')
  } catch (error) {
    console.error('Error parsing conversation from text:', error)
    toast.show('Lỗi khi parse hội thoại từ text', 'error')
  }
}

// Hàm parse conversation text chung
const parseConversationText = (text) => {
  // Loại bỏ các ký tự đặc biệt ở đầu và cuối file và xử lý \r\n
  const cleanedText = text.trim().replace(/^["']|["']$/g, '').replace(/\r/g, '')
  const lines = cleanedText.split('\n').filter(line => line.trim())
  const parsedConversation = []
    
  for (const line of lines) {
    // Xử lý định dạng "User: text" hoặc "Bot: text" - sửa regex để linh hoạt hơn
    const cleanLine = line.replace(/\r$/, '') // Loại bỏ \r ở cuối dòng
    const match = cleanLine.match(/^\s*(User|Bot)\s*:\s*(.+)$/i)
    if (match) {
      const speaker = match[1].toLowerCase()
      const text = match[2].trim()
      
      if (speaker === 'user' || speaker === 'bot') {
        parsedConversation.push({
          speaker: speaker,
          text: text
        })
      }
    } else {
      console.log('Line not matched:', cleanLine) // Debug log for unmatched lines
    }
  }
  
  return parsedConversation
}

// Hàm xử lý upload file conversation
const handleConversationFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Kiểm tra loại file - chỉ chấp nhận .txt
  if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
    toast.show('Chỉ chấp nhận file .txt', 'error')
    conversationFile.value = null
    return
  }

  // Đọc file
  const reader = new FileReader()
  reader.onload = (e) => {
    conversationFileContent.value = e.target.result
  }
  reader.onerror = () => {
    toast.show('Lỗi khi đọc file', 'error')
    conversationFile.value = null
    conversationFileContent.value = ''
  }
  
  reader.readAsText(file)
}

const parseConversationFromFile = () => {
  if (!conversationFileContent.value) {
    toast.show('Không có nội dung file để parse', 'error')
    return
  }

  try {
    const parsedConversation = parseConversationText(conversationFileContent.value)
    
    if (parsedConversation.length === 0) {
      toast.show('Không tìm thấy hội thoại hợp lệ trong file. Định dạng: "User: text" hoặc "Bot: text"', 'error')
      return
    }
    
    formAddActivity.value.conversation_text = parsedConversation
    toast.show(`Đã parse thành công ${parsedConversation.length} tin nhắn từ file`, 'success')
  } catch (error) {
    console.error('Error parsing conversation from file:', error)
    toast.show('Lỗi khi parse hội thoại từ file', 'error')
  }
}

onMounted(() => {
  fetchListLessons()
  fetchUnits()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.toolbar-sticky {
  position: sticky;
  top: 0;
  transition: transform 0.3s ease;
  z-index: 100;
}

.card-option {
  display: flex;
  align-items: center;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.z-index-10 {
  z-index: 10;
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.unit-card {
  transition: all 0.3s ease;
}

.lessons-container, .activities-container {
  height: 70vh;
  overflow-y: auto;
}

.unit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.toolbar-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  padding-top: 8px;
  transition: transform 0.3s ease;
}

.toolbar-hidden {
  transform: translateY(-100%);
}

.v-card.unit-card {
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.unit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.btn-add-unit {
  .v-btn {
    font-weight: 500;
    font-size: 14px;
    padding: 8px 16px;
    i {
      margin-right: 8px;
    }
  }
}

.scroll-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  transition: opacity 0.3s ease;
}

.panel-container {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.panel-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.lesson-panel {
  flex: 1;
  height: max-content;
  position: sticky;
  top: 20px;
}

.activity-panel {
  flex: 2;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.search-add-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
}

.search-input {
  flex: 1;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lesson-item:hover {
  background-color: #f5f5f5;
}

.lesson-item.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.lesson-content {
  flex: 1;
}

.lesson-content h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.lesson-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.delete-btn, .edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  margin-left: 5px;
  color: #666;
}

.delete-btn:hover {
  color: #f44336;
}

.edit-btn:hover {
  color: #2196f3;
}

.empty-lessons, .empty-activities {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-lessons i, .empty-activities i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.activity-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.activity-image {
  height: 150px;
  overflow: hidden;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.activity-content {
  padding: 15px;
}

.activity-content h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.activity-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.activity-actions {
  padding: 10px 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eee;
}

.current-image {
  margin-bottom: 15px;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  margin-top: 10px;
}

/* Conversation Editor Styles */
.conversation-editor {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.conversation-messages {
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.message-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.bot-message {
  align-items: flex-start;
}

.user-message {
  align-items: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 18px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bot-message .message-bubble {
  background-color: #e0e0e0;
  border-bottom-left-radius: 4px;
}

.user-message .message-bubble {
  background-color: #2196f3;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-text {
  flex: 1;
  word-break: break-word;
}

.delete-message-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-message-btn:hover {
  opacity: 1;
}

.message-sender {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.user-message .message-sender {
  text-align: right;
}

.no-messages {
  text-align: center;
  padding: 20px;
  color: #999;
}

.add-message-form {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.update-btn {
  background-color: rgb(36, 138, 36);
  color: white;
}

@media screen and (max-width: 1024px) {
  .btn-add-unit {
    .v-btn {
      width: 100%;
      justify-content: center;
    }
  }
  
  .panel-container {
    flex-direction: column;
  }
  
  .search-add-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .activity-grid {
    grid-template-columns: 1fr;
  }
  
  .message-bubble {
    max-width: 85%;
  }
}

.title-detail-unit {
  background-color: #2196f3;
  color: white;
  font-weight: 600;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px;
}

.title-detail {
  background-color: #2196f3;
  color: white;
  font-weight: 600;
  box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px;
}

.audio-list {
  max-height: 500px;
  overflow-y: auto;
}

.audio-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 12px;
}

.audio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.speaker-badge, .index-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.audio-text {
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  border-left: 4px solid #2196f3;
}

.text-content {
  font-style: italic;
  color: #333;
}

.highlighted-text {
  background-color: #fff3e0;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: 500;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.audio-player {
  display: none;
}

.play-btn {
  min-width: 80px;
}

.play-btn.playing {
  background-color: #ff5722;
  color: white;
}

.audio-duration {
  font-size: 0.875rem;
  color: #666;
  min-width: 50px;
}

.no-audio {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

/* Conversation preview styles */
.conversation-preview {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.conversation-text {
  max-height: 200px;
  overflow-y: auto;
}

.conversation-line {
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 4px;
  display: flex;
  align-items: flex-start;
  transition: background-color 0.3s;
}

.conversation-line.highlighted {
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.speaker-tag {
  font-weight: bold;
  color: #1976d2;
  min-width: 50px;
  margin-right: 8px;
}

.playing-indicator {
  color: #ff5722;
  margin-left: auto;
}

/* Style cho nút play audio trong activity card */
.play-audio-btn {
  background: none;
  border: none;
  color: #1976d2;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.play-audio-btn:hover {
  background-color: #e3f2fd;
}
</style>
