<script setup>
import { useLayout } from '@/layout/composables/layout';
import axiosInstance from '@/util/axios-config';
import { onMounted, ref, watch } from 'vue';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const chartData = ref(null);
const chartOptions = ref(null);
const gradeLabels = ref([]);
const sectionMap = ref({}); // { 'A': [10, 12, 5], 'B': [4, 8, 9] }

async function fetchChartData() {
    try {
        const response = await axiosInstance.get('/reading-performance');
        const result = response.data.data; // ✅ Use .data.data
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
    <div class="card">
        <div class="font-semibold text-xl mb-4">Reading Performance Metrics</div>
        <Chart type="bar" :data="chartData" :options="chartOptions" class="h-80" />
    </div>
</template>
