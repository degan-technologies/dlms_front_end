<script setup>
import { useLayout } from '@/layout/composables/layout';
import axiosInstance from '@/util/axios-config';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);
const gradeLabels = ref([]);
const sectionMap = ref({});
const loading = ref(true); // <-- loading state

async function fetchChartData() {
    try {
        const response = await axiosInstance.get('/reading-performance');
        const result = response.data.data;
        console.log('Reading Performance Data:', result);

        const tempMap = {};
        const grades = [];

        result.forEach((grade) => {
            grades.push(`Grade ${grade.name}`);
            grade.sections.forEach((section) => {
                if (!tempMap[section.name]) {
                    tempMap[section.name] = [];
                }
                tempMap[section.name].push(section.read_count ?? 0);
            });
        });

        gradeLabels.value = grades;
        sectionMap.value = tempMap;
        chartData.value = setChartData();
    } catch (error) {
        console.error('Failed to fetch reading performance:', error);
    } finally {
        loading.value = false; // turn off loading
    }
}

function setChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const sectionColors = ['--p-primary-400', '--p-primary-300', '--p-primary-200', '--p-primary-100'];

    const datasets = Object.entries(sectionMap.value).map(([section, counts], idx) => ({
        type: 'bar',
        label: `Section ${section}`,
        data: counts,
        backgroundColor: documentStyle.getPropertyValue(sectionColors[idx % sectionColors.length]),
        barThickness: 32
    }));

    return {
        labels: gradeLabels.value,
        datasets
    };
}

function setChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const borderColor = documentStyle.getPropertyValue('--surface-border');
    const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

    return {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    }
                }
            },
            legend: {
                display: true
            }
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: 'transparent',
                    borderColor: 'transparent'
                }
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Number of Students'
                },
                ticks: {
                    color: textMutedColor
                },
                grid: {
                    color: borderColor,
                    borderColor: 'transparent',
                    drawTicks: false
                }
            }
        }
    };
}

watch([getPrimary, getSurface, isDarkTheme], () => {
    chartData.value = setChartData();
    chartOptions.value = setChartOptions();
});

onMounted(async () => {
    await fetchChartData();
    chartOptions.value = setChartOptions();
});
</script>
<template>
    <div class="w-full p-0 md:p-6">
        <div class="font-semibold text-xl mb-4">Reading Performance Metrics</div>

        <!-- Graph Loading Skeleton -->
        <div v-if="loading" class="h-80 w-full flex flex-col justify-between animate-pulse">
            <div class="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <!-- Simulated heading or axis -->
            <div class="flex-1 grid grid-cols-12 gap-2 items-end px-2">
                <div v-for="n in 12" :key="n" class="bg-gray-300 rounded-t w-full" :style="{ height: `${Math.random() * 60 + 40}%` }"></div>
            </div>
            <div class="h-4 bg-gray-200 rounded mt-4 w-3/4"></div>
            <!-- Simulated x-axis labels -->
        </div>

        <!-- Actual Chart -->
        <Chart v-else type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
