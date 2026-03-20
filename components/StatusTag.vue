<template>
  <view class="status-tag" :class="typeClass">{{ status }}</view>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    typeClass() {
      return `status-${this.type || 'default'}`
    }
  }
}
</script>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44rpx;
  padding: 0 18rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.status-default {
  background: #f0f3f5;
  color: #6c757d;
}

.status-success {
  background: #e8f5e9;
  color: #1b5e20;
}

.status-warning {
  background: #fff3e0;
  color: #e65100;
}

.status-error {
  background: #ffebee;
  color: #c62828;
}

.status-info {
  background: #e3f2fd;
  color: #1565c0;
}
</style>
